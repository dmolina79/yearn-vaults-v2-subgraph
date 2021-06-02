import { log, ethereum, BigInt } from '@graphprotocol/graph-ts';
import { Strategy, StrategyReport } from '../../../generated/schema';

import { buildIdFromEvent, getTimestampInMillis } from '../commons';

export function getOrCreate(
  transactionId: string,
  strategy: Strategy,
  gain: BigInt,
  loss: BigInt,
  totalGain: BigInt,
  totalLoss: BigInt,
  totalDebt: BigInt,
  debtAdded: BigInt,
  debtLimit: BigInt,
  debtPaid: BigInt,
  event: ethereum.Event
): StrategyReport {
  log.info('[StrategyReport] Get or create strategy report', []);

  let strategyReportId = buildIdFromEvent(event);
  let strategyReport = StrategyReport.load(strategyReportId);
  if (strategyReport == null) {
    strategyReport = new StrategyReport(strategyReportId);
    strategyReport.strategy = strategy.id;
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
    strategyReport.debtPaid = debtPaid;
    strategyReport.save();
  }
  return strategyReport!;
}
