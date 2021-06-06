import { BigInt } from '@graphprotocol/graph-ts';
import { Yearn } from '../../generated/schema';
import { BIGINT_ZERO, YEARN_ENTITY_ID } from './constants';

export function addTreasuryFee(fee: BigInt): void {
  let yearn = Yearn.load(YEARN_ENTITY_ID);

  if (yearn === null) {
    yearn = createYearn();
  }

  yearn.treasuryFeesUsdc = yearn.treasuryFeesUsdc.plus(fee);
  yearn.totalFeesUsdc = yearn.totalFeesUsdc.plus(fee);

  yearn.save();
}

export function addStrategyFee(fee: BigInt): void {
  let yearn = Yearn.load(YEARN_ENTITY_ID);

  if (yearn === null) {
    yearn = createYearn();
  }

  yearn.strategyFeesUsdc = yearn.strategyFeesUsdc.plus(fee);
  yearn.totalFeesUsdc = yearn.totalFeesUsdc.plus(fee);

  yearn.save();
}

function createYearn(): Yearn {
  let yearn = new Yearn(YEARN_ENTITY_ID);
  yearn.treasuryFeesUsdc = BIGINT_ZERO;
  yearn.strategyFeesUsdc = BIGINT_ZERO;
  yearn.totalFeesUsdc = BIGINT_ZERO;
  return yearn;
}
