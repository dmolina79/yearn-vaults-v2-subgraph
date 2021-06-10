import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Token } from '../../generated/schema';

import { ERC20 } from '../../generated/Registry/ERC20';
import { BIGINT_ZERO, DEFAULT_DECIMALS } from '../utils/constants';

export function getOrCreateToken(address: Address): Token {
  let id = address.toHexString();
  let token = Token.load(id);

  if (token == null) {
    token = new Token(id);
    let erc20Contract = ERC20.bind(address);
    let decimals = erc20Contract.try_decimals();
    // Using try_cause some values might be missing
    let name = erc20Contract.try_name();
    let symbol = erc20Contract.try_symbol();
    // TODO: add overrides for name and symbol
    token.decimals = decimals.reverted ? DEFAULT_DECIMALS : decimals.value;
    token.name = name.reverted ? '' : name.value;
    token.symbol = symbol.reverted ? '' : symbol.value;
    token.strategyFees = BIGINT_ZERO;
    token.treasuryFees = BIGINT_ZERO;
    token.totalFees = BIGINT_ZERO;
    token.save();
  }
  return token as Token;
}

export function addStrategyFee(token: Token, amount: BigInt): void {
  token.strategyFees = token.strategyFees.plus(amount);
  token.totalFees = token.totalFees.plus(amount);
  token.save();
}

export function addTreasuryFee(token: Token, amount: BigInt): void {
  token.treasuryFees = token.treasuryFees.plus(amount);
  token.totalFees = token.totalFees.plus(amount);
  token.save();
}
