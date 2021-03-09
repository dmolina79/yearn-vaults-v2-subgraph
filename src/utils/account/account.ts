import { Address, log } from '@graphprotocol/graph-ts';
import {
  Account,
} from '../../../generated/schema';

export function getOrCreateAccount(address: Address): Account {
  log.debug('[Account] Get or create account', [])
  let id = address.toHexString();
  let account = Account.load(id);

  if (account == null) {
    account = new Account(id);
    account.save();
  }

  return account as Account;
}