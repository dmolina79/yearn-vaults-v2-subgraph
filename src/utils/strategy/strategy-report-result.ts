import { log } from '@graphprotocol/graph-ts';
import {
  StrategyReport,
  StrategyReportResult,
  Transaction,
} from '../../../generated/schema';
import { buildIdFromTransaction } from '../commons';
import { BIGDECIMAL_ZERO, DAYS_PER_YEAR, MS_PER_DAY } from '../constants';

export function create(
  transaction: Transaction,
  previousReport: StrategyReport,
  currentReport: StrategyReport
): StrategyReportResult {
  log.debug(
    '[StrategyReportResult] Create strategy report result between previous {} and current report {}. Strategy {}',
    [previousReport.id, currentReport.id, currentReport.strategy]
  );

  let id = buildIdFromTransaction(transaction);
  let strategyReportResult = new StrategyReportResult(id);
  strategyReportResult.timestamp = transaction.timestamp;
  strategyReportResult.blockNumber = transaction.blockNumber;
  strategyReportResult.report = currentReport.id;
  strategyReportResult.startTimestamp = previousReport.timestamp;
  strategyReportResult.endTimestamp = currentReport.timestamp;
  strategyReportResult.duration = currentReport.timestamp
    .toBigDecimal()
    .minus(previousReport.timestamp.toBigDecimal());
  strategyReportResult.durationPr = BIGDECIMAL_ZERO;
  strategyReportResult.apr = BIGDECIMAL_ZERO;
  strategyReportResult.transaction = transaction.id;

  let profit = currentReport.totalGain.minus(previousReport.totalGain);
  let msInDays = strategyReportResult.duration.div(MS_PER_DAY);
  log.info(
    '[StrategyReportResult] Report Result - Start / End: {} / {} - Duration: {} (days {}) - Profit: {}',
    [
      strategyReportResult.startTimestamp.toString(),
      strategyReportResult.endTimestamp.toString(),
      strategyReportResult.duration.toString(),
      msInDays.toString(),
      profit.toString(),
    ]
  );

  if (
    !currentReport.totalDebt.isZero() &&
    !profit.isZero() &&
    !msInDays.equals(BIGDECIMAL_ZERO)
  ) {
    let profitOverTotalDebt = profit
      .toBigDecimal()
      .div(currentReport.totalDebt.toBigDecimal());
    strategyReportResult.durationPr = profitOverTotalDebt;
    let yearOverDuration = DAYS_PER_YEAR.div(msInDays);
    let apr = profitOverTotalDebt.times(yearOverDuration);

    log.info(
      '[StrategyReportResult] Report Result - Duration: {} ms / {} days - Duration (Year): {} - Profit / Total Debt: {} / APR: {}',
      [
        strategyReportResult.duration.toString(),
        msInDays.toString(),
        yearOverDuration.toString(),
        profitOverTotalDebt.toString(),
        apr.toString(),
      ]
    );
    strategyReportResult.apr = apr;
  }
  strategyReportResult.save();
  return strategyReportResult!;
}
