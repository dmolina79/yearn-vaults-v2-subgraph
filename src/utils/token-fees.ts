import { Token, TokenFees } from '../../generated/schema';
import { BigInt, log } from '@graphprotocol/graph-ts';
import { BIGINT_ZERO } from './constants';

export function create(tokenId: string): TokenFees {
  let fees = new TokenFees(tokenId);
  fees.strategyFees = BIGINT_ZERO;
  fees.treasuryFees = BIGINT_ZERO;
  fees.totalFees = BIGINT_ZERO;
  fees.save();
  return fees;
}

export function addStrategyFee(tokenId: string, amount: BigInt): void {
  let fees = TokenFees.load(tokenId);
  if (fees !== null) {
    fees.strategyFees = fees.strategyFees.plus(amount);
    fees.totalFees = fees.totalFees.plus(amount);
    fees.save();
  } else {
    log.warning(
      'trying to add adding strategy fees for token {} but it has not been created',
      [tokenId]
    );
  }
}

export function addTreasuryFee(tokenId: string, amount: BigInt): void {
  let fees = TokenFees.load(tokenId);
  if (fees !== null) {
    fees.treasuryFees = fees.treasuryFees.plus(amount);
    fees.totalFees = fees.totalFees.plus(amount);
    fees.save();
  } else {
    log.warning(
      'trying to add adding treasury fees for token {} but it has not been created',
      [tokenId]
    );
  }
}
