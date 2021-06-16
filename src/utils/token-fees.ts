import { TokenFee } from '../../generated/schema';
import { BigInt, log } from '@graphprotocol/graph-ts';
import { BIGINT_ZERO } from './constants';

export function addStrategyFee(tokenId: string, amount: BigInt): void {
  let fee = TokenFee.load(tokenId);
  if (fee === null) {
    fee = create(tokenId);
  }
  fee.strategyFees = fee.strategyFees.plus(amount);
  fee.totalFees = fee.totalFees.plus(amount);
  fee.save();
}

export function addTreasuryFee(tokenId: string, amount: BigInt): void {
  let fee = TokenFee.load(tokenId);
  if (fee === null) {
    fee = create(tokenId);
  }
  fee.treasuryFees = fee.treasuryFees.plus(amount);
  fee.totalFees = fee.totalFees.plus(amount);
  fee.save();
}

function create(tokenId: string): TokenFee {
  let fees = new TokenFee(tokenId);
  fees.strategyFees = BIGINT_ZERO;
  fees.treasuryFees = BIGINT_ZERO;
  fees.totalFees = BIGINT_ZERO;
  fees.token = tokenId;
  fees.save();
  return fees;
}
