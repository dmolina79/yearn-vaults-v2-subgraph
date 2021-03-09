import { log } from "@graphprotocol/graph-ts";
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
import { MAX_UINT } from "../utils/constants";
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
  let vaultContract = VaultContract.bind(call.to)
  vaultLibrary.deposit(
    call.block.timestamp,
    call.block.number,
    call.from,
    call.to,
    MAX_UINT,
    vaultContract.totalAssets(),
    vaultContract.totalSupply(),
    vaultContract.pricePerShare(),
    call.transaction
  );
}

export function handleDepositWithAmount(call: Deposit1Call): void {
  log.debug('[Vault mappings] Handle deposit with amount', [])
  getOrCreateTransactionFromCall(
    call,
    'vault.deposit(uint)'
  )
  let vaultContract = VaultContract.bind(call.to)
  vaultLibrary.deposit(
    call.block.timestamp,
    call.block.number,
    call.from,
    call.to,
    call.inputs._amount,
    vaultContract.totalAssets(),
    vaultContract.totalSupply(),
    vaultContract.pricePerShare(),
    call.transaction
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
    call.block.timestamp,
    call.block.number,
    call.inputs._recipient,
    call.to,
    call.inputs._amount,
    vaultContract.totalAssets(),
    vaultContract.totalSupply(),
    vaultContract.pricePerShare(),
    call.transaction
  );
}

export function handleWithdraw(call: WithdrawCall): void {
  log.info('[Vault mappings] Handle withdraw. TX hash: {}', [call.transaction.hash.toHexString()])
  getOrCreateTransactionFromCall(
    call,
    'vault.withdraw()'
  )
  log.info('[Vault mappings] Handle withdraw(): Vault address {}', [call.to.toHexString()])
  let vaultContract = VaultContract.bind(call.to);
  let totalSharesToBurnt = vaultContract.balanceOf(call.from);

  vaultLibrary.withdraw(
    call.block.timestamp,
    call.block.number,
    call.from,
    call.to,
    call.outputs.value0,
    totalSharesToBurnt,
    vaultContract.pricePerShare(),
    call.transaction,
  )
}

export function handleWithdrawWithShares(call: Withdraw1Call): void {
  log.info('[Vault mappings] Handle withdraw with shares. TX hash: {}', [call.transaction.hash.toHexString()])
  getOrCreateTransactionFromCall(
    call,
    'vault.withdraw(uint256)'
  )
  log.info('[Vault mappings] Handle withdraw(shares): Vault address {}', [call.to.toHexString()])
  let vaultContract = VaultContract.bind(call.to);

  vaultLibrary.withdraw(
    call.block.timestamp,
    call.block.number,
    call.from,
    call.to,
    call.outputs.value0,
    call.inputs._shares,
    vaultContract.pricePerShare(),
    call.transaction,
  )
}

export function handleWithdrawWithSharesAndRecipient(call: Withdraw2Call): void {
  log.info('[Vault mappings] Handle withdraw with shares and recipient. TX hash: {}', [call.transaction.hash.toHexString()])
  getOrCreateTransactionFromCall(
    call,
    'vault.withdraw(uint256,address)'
  )
  log.info('[Vault mappings] Handle withdraw(shares, recipient): Vault address {}', [call.to.toHexString()])
  let vaultContract = VaultContract.bind(call.to);

  vaultLibrary.withdraw(
    call.block.timestamp,
    call.block.number,
    call.inputs._recipient,
    call.to,
    call.outputs.value0,
    call.inputs._shares,
    vaultContract.pricePerShare(),
    call.transaction,
  )
}

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