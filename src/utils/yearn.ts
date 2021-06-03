import { BigInt } from '@graphprotocol/graph-ts';
import { Yearn } from '../../generated/schema';
import { BIGINT_ZERO, YEARN_ENTITY_ID } from './constants';

export function addProtocolFee(fee: BigInt): void {
  let yearn = Yearn.load(YEARN_ENTITY_ID);

  if (yearn === null) {
    yearn = new Yearn(YEARN_ENTITY_ID);
    yearn.totalFeesUsdc = BIGINT_ZERO;
  }

  yearn.totalFeesUsdc = yearn.totalFeesUsdc.plus(fee);

  yearn.save();
}
