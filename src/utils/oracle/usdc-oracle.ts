import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Oracle as OracleContract } from '../../../generated/registry/Oracle';
import { BIGINT_ZERO, USDC_ORACLE_ADDRESS } from '../constants';

export function usdcPrice(tokenAddress: Address, tokenAmount: BigInt): BigInt {
  let tokenAmountUsdc: BigInt = BIGINT_ZERO;

  let oracle = OracleContract.bind(Address.fromString(USDC_ORACLE_ADDRESS));
  if (oracle !== null) {
    let result = oracle.try_getNormalizedValueUsdc(tokenAddress, tokenAmount);
    if (result.reverted === false) {
      tokenAmountUsdc = result.value;
    }
  }

  return tokenAmountUsdc;
}
