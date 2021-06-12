import { Address } from '@graphprotocol/graph-ts';
import { Token, TokenFees } from '../../generated/schema';
import { ERC20 } from '../../generated/Registry/ERC20';
import { BIGINT_ZERO, DEFAULT_DECIMALS } from '../utils/constants';
import * as tokenFeeLibrary from './token-fees';

export function getOrCreateToken(address: Address): Token {
  let id = address.toHexString();
  let token = Token.load(id);

  if (token == null) {
    token = new Token(id);
    let fees = tokenFeeLibrary.create(id);
    let erc20Contract = ERC20.bind(address);
    let decimals = erc20Contract.try_decimals();
    // Using try_cause some values might be missing
    let name = erc20Contract.try_name();
    let symbol = erc20Contract.try_symbol();
    // TODO: add overrides for name and symbol
    token.decimals = decimals.reverted ? DEFAULT_DECIMALS : decimals.value;
    token.name = name.reverted ? '' : name.value;
    token.symbol = symbol.reverted ? '' : symbol.value;
    token.fees = fees.id;
    token.save();
  }
  return token as Token;
}
