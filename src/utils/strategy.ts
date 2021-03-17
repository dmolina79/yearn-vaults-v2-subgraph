import { log, ethereum, BigInt, Address, Bytes } from '@graphprotocol/graph-ts';
import { Harvest, Strategy, StrategyReport } from '../../generated/schema';
import { Strategy as StrategyTemplate } from '../../generated/templates';
import { Strategy as StrategyContract } from '../../generated/templates/Vault/Strategy';

import { buildIdFromEvent, getTimestampInMillis } from './commons';

export function create(
  transactionId: string,
  strategyAddress: Address,
  vault: Address,
  debtLimit: BigInt,
  rateLimit: BigInt,
  performanceFee: BigInt,
  event: ethereum.Event
): Strategy {
  log.debug('[Strategy] Create', []);
  let strategyId = strategyAddress.toHexString();
  let strategy = Strategy.load(strategyId);
  if (strategy == null) {
    let strategyContract = StrategyContract.bind(strategyAddress);
    strategy = new Strategy(strategyId);
    strategy.blockNumber = event.block.number;
    strategy.timestamp = getTimestampInMillis(event.block);
    strategy.transaction = transactionId;
    let tryName = strategyContract.try_name();
    strategy.name = tryName.reverted ? 'TBD' : tryName.value.toString();
    strategy.address = strategyAddress;
    strategy.vault = vault.toHexString();
    strategy.debtLimit = debtLimit;
    strategy.rateLimit = rateLimit;
    strategy.performanceFeeBps = performanceFee.toI32();
    strategy.save();
    StrategyTemplate.create(strategyAddress);
  }
  return strategy!;
}

export function createReport(
  transactionId: string,
  strategyId: string,
  gain: BigInt,
  loss: BigInt,
  totalGain: BigInt,
  totalLoss: BigInt,
  totalDebt: BigInt,
  debtAdded: BigInt,
  debtLimit: BigInt,
  event: ethereum.Event
): StrategyReport {
  log.debug('[Strategy] Create report', []);
  let strategy = Strategy.load(strategyId);
  if (strategy !== null) {
    let strategyReportId = buildIdFromEvent(event);
    let strategyReport = StrategyReport.load(strategyReportId);
    if (strategyReport == null) {
      strategyReport = new StrategyReport(strategyReportId);
      strategyReport.strategy = strategyId;
      strategyReport.blockNumber = event.block.number;
      strategyReport.timestamp = getTimestampInMillis(event.block);
      strategyReport.transaction = transactionId;
      strategyReport.gain = gain;
      strategyReport.loss = loss;
      strategyReport.totalGain = totalGain;
      strategyReport.totalLoss = totalLoss;
      strategyReport.totalDebt = totalDebt;
      strategyReport.debtAdded = debtAdded;
      strategyReport.debtLimit = debtLimit;
      strategyReport.save();
    }
    return strategyReport!;
  }
  return null;
}

export function harvest(
  harvester: Address,
  strategyAddress: Address,
  timestamp: BigInt,
  blockNumber: BigInt,
  transactionHash: Bytes,
  transactionIndex: BigInt,
  profit: BigInt,
  loss: BigInt,
  debtPayment: BigInt,
  debtOutstanding: BigInt
): Harvest {
  log.debug('[Strategy] Harvest', []);
  let harvestId = strategyAddress
    .toHexString()
    .concat('-')
    .concat(transactionHash.toHexString())
    .concat('-')
    .concat(transactionIndex.toString());
  let harvest = Harvest.load(harvestId);

  if (harvest == null) {
    let strategyContract = StrategyContract.bind(strategyAddress);
    harvest = new Harvest(harvestId);
    harvest.timestamp = timestamp;
    harvest.blockNumber = blockNumber;
    harvest.transaction = transactionHash.toHexString();
    harvest.vault = strategyContract.vault().toHexString();
    harvest.strategy = strategyAddress.toHexString();
    harvest.harvester = harvester;
    harvest.profit = profit;
    harvest.loss = loss;
    harvest.debtPayment = debtPayment;
    harvest.debtOutstanding = debtOutstanding;
    harvest.save();
  }

  return harvest!;
}
