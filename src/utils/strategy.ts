import { log, ethereum, BigInt, Address  } from "@graphprotocol/graph-ts";
import {
  Strategy,
  StrategyReport,
} from "../../generated/schema";

import {
  Strategy as StrategyContract
} from "../../generated/templates/Vault/Strategy";

import { buildIdFromEvent, getTimestampInMillis } from "./commons";

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
  let strategy = Strategy.load(strategyId)
  if (strategy !== null) {
    let strategyReportId = buildIdFromEvent(event)
    let strategyReport = StrategyReport.load(strategyReportId)
    if (strategyReport == null) {
      strategyReport = new StrategyReport(strategyReportId)
      strategyReport.strategy = strategyId
      strategyReport.blockNumber = event.block.number
      strategyReport.timestamp = getTimestampInMillis(event.block)
      strategyReport.transaction = transactionId
      strategyReport.gain = gain
      strategyReport.loss = loss
      strategyReport.totalGain = totalGain
      strategyReport.totalLoss = totalLoss
      strategyReport.totalDebt = totalDebt
      strategyReport.debtAdded = debtAdded
      strategyReport.debtLimit = debtLimit
      strategyReport.save()
    }
    return strategyReport!
  }
  return null
}

export function create(
  transactionId: string,
  strategyAddress: Address,
  vault: Address,
  debtLimit: BigInt,
  rateLimit: BigInt,
  performanceFee: BigInt,
  event: ethereum.Event
): Strategy {
  let id = strategyAddress.toHexString()
  let strategy = Strategy.load(id)
  if (strategy == null) {
    let strategyContract = StrategyContract.bind(strategyAddress);
    strategy = new Strategy(id)
    strategy.blockNumber = event.block.number
    strategy.timestamp = getTimestampInMillis(event.block)
    strategy.transaction = transactionId
    let tryName = strategyContract.try_name();
    strategy.name = tryName.reverted ? "TBD" : tryName.value.toString();
    strategy.address = strategyAddress
    strategy.vault = vault.toHexString()
    strategy.debtLimit = debtLimit
    strategy.rateLimit = rateLimit
    strategy.performanceFeeBps = performanceFee.toI32();
    strategy.save()
  }
  return strategy!
}