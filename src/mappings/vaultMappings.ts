import { Address, ethereum, BigInt, log } from "@graphprotocol/graph-ts";
import {
  StrategyAdded as StrategyAddedEvent,
  StrategyReported as StrategyReportedEvent,
  Deposit1Call as DepositCall,
  Transfer as TransferEvent,
  Withdraw1Call as WithdrawCall,
  Vault as VaultContract,
  Deposit2Call,
  Deposit1Call,
  Withdraw1Call,
  Withdraw2Call,
} from "../../generated/Registry/Vault";
import { createStrategy, reportStrategy } from "../utils/strategy"
import { getOrCreateTransactionFromCall, getOrCreateTransactionFromEvent } from "../utils/transaction";
import * as vaultLibrary from '../utils/vault/vault'

export function handleStrategyAdded(event: StrategyAddedEvent): void {
  let ethTransaction = getOrCreateTransactionFromEvent(
    event, 
    "StrategyAddedEvent"
  )
  createStrategy(
    ethTransaction.id,
    event.params.strategy,
    event.address,
    event.params.debtLimit,
    event.params.rateLimit,
    event.params.performanceFee,
    event,
  )
}

export function handleStrategyReported(event: StrategyReportedEvent): void {
  let ethTransaction = getOrCreateTransactionFromEvent(
    event, 
    "StrategyReportedEvent"
  )
  reportStrategy(
    ethTransaction.id,
    event.params.strategy.toHexString(),
    event.params.gain,
    event.params.loss,
    event.params.totalGain,
    event.params.totalLoss,
    event.params.totalDebt,
    event.params.debtAdded,
    event.params.debtLimit,
    event,
  )
}


//  VAULT BALANCE UPDATES

export function handleDeposit(call: DepositCall): void {
  log.debug('[Vault mappings] Handle deposit', [])
  getOrCreateTransactionFromCall(
    call,
    'vault.deposit()'
  )
}

export function handleDepositWithAmount(call: Deposit1Call): void {
  log.debug('[Vault mappings] Handle deposit with amount', [])
  getOrCreateTransactionFromCall(
    call,
    'vault.deposit(uint)'
  )
  let vaultContract = VaultContract.bind(call.to)
  vaultLibrary.deposit(
    call.transaction.hash,
    call.transaction.index,
    call.block.timestamp,
    call.block.number,
    call.from,
    call.to,
    call.inputs._amount,
    vaultContract.totalAssets(),
    vaultContract.totalSupply(),
    vaultContract.pricePerShare()
  );
}

export function handleDepositWithAmountAndRecipient(call: Deposit2Call): void {
  log.debug('[Vault mappings] Handle deposit with amount and recipient', [])
  getOrCreateTransactionFromCall(
    call,
    'vault.deposit(uint,address)'
  )
  let vaultContract = VaultContract.bind(call.to)
  vaultLibrary.deposit(
    call.transaction.hash,
    call.transaction.index,
    call.block.timestamp,
    call.block.number,
    call.inputs._recipient,
    call.to,
    call.inputs._amount,
    vaultContract.totalAssets(),
    vaultContract.totalSupply(),
    vaultContract.pricePerShare()
  );
}

export function handleWithdraw(call: WithdrawCall): void {
  log.debug('[Vault mappings] Handle withdraw', [])
  getOrCreateTransactionFromCall(
    call,
    'vault.withdraw()'
  )
}

export function handleWithdrawWithShares(call: Withdraw1Call): void {
  log.debug('[Vault mappings] Handle withdraw with shares', [])
  getOrCreateTransactionFromCall(
    call,
    'vault.withdraw(uint256)'
  )
}

export function handleWithdrawWithSharesAndRecipient(call: Withdraw2Call): void {
  log.debug('[Vault mappings] Handle withdraw with shares and recipient', [])
  getOrCreateTransactionFromCall(
    call,
    'vault.withdraw(uint256,address)'
  )
}

// export function handleWithdrawWithSharesRecipientAndMaxLoss(call: Withdraw3Call): void {
//   log.debug('[Vault mappings] Handle withdraw with shares and recipient', [])
// }

export function handleTransfer(event: TransferEvent): void {
  // let vaultContract = VaultContract.bind(event.address)
  // internalMapTransfer(
  //   event.transaction.hash,
  //   event.transaction.index,
  //   event.address,
  //   event.params.sender,
  //   event.params.receiver,
  //   event.params.value,
  //   vaultContract.totalAssets(),
  //   vaultContract.totalSupply(),
  //   event.block.timestamp,
  //   event.block.number
  // );
}