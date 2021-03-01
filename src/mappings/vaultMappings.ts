import { Address, ethereum, BigInt, log } from "@graphprotocol/graph-ts";
import {
  StrategyAdded as StrategyAddedEvent,
  StrategyReported as StrategyReportedEvent,
  Deposit1Call as DepositCall,
  Transfer as TransferEvent,
  Withdraw1Call as WithdrawCall,
  Vault as VaultContract,
} from "../../generated/Registry/Vault";
import {
  getOrCreateDeposit,
  internalMapTransfer,
  internalMapWithdrawal,
} from "../utils/vaultBalanceUpdates";
import { getOrCreateVault } from "../utils/vault";
import { createStrategy, reportStrategy } from "../utils/strategy";
import { getOrCreateTransactionFromCall, getOrCreateTransactionFromEvent } from "../utils/transaction";


export function addStrategyToVault(
  transactionId: string,
  vaultAddress: Address,
  strategy: Address,
  debtLimit: BigInt,
  performanceFee: BigInt,
  rateLimit: BigInt,
  event: ethereum.Event,
): void {
  let vault = getOrCreateVault(vaultAddress, false)
  if(vault !== null) {
    createStrategy(
      transactionId,
      strategy,
      vaultAddress,
      debtLimit,
      rateLimit,
      performanceFee,
      event
    )
  }
}

export function handleStrategyAdded(event: StrategyAddedEvent): void {
  let ethTransaction = getOrCreateTransactionFromEvent(event, "StrategyAddedEvent")

  // TODO: refactor to createStrategy since derived links vault + strat
  addStrategyToVault(
    ethTransaction.id,
    event.address,
    event.params.strategy,
    event.params.debtLimit,
    event.params.performanceFee,
    event.params.rateLimit,
    event
  )
}

export function handleStrategyReported(event: StrategyReportedEvent): void {
  let ethTransaction = getOrCreateTransactionFromEvent(event, "StrategyReportedEvent")
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
  // getOrCreateTransactionFromCall(
  //   call
  // )
  // let vaultContract = VaultContract.bind(call.to)
  // getOrCreateDeposit(
  //   call.transaction.hash,
  //   call.transaction.index,
  //   call.to,
  //   call.from,
  //   call.inputs._amount,
  //   vaultContract.totalAssets(),
  //   vaultContract.totalSupply(),
  //   vaultContract.pricePerShare(),
  //   call.block.timestamp,
  //   call.block.number
  // );
}

export function handleWithdrawal(call: WithdrawCall): void {
  let vaultContract = VaultContract.bind(call.to)
 internalMapWithdrawal(
  call.transaction.hash,
  call.transaction.index,
  call.to,
  call.from,
  call.inputs._shares,
  vaultContract.totalAssets(),
  vaultContract.totalSupply(),
  vaultContract.pricePerShare(),
  call.block.timestamp,
  call.block.number
 );
}

export function handleTransfer(event: TransferEvent): void {
  let vaultContract = VaultContract.bind(event.address)
  internalMapTransfer(
    event.transaction.hash,
    event.transaction.index,
    event.address,
    event.params.sender,
    event.params.receiver,
    event.params.value,
    vaultContract.totalAssets(),
    vaultContract.totalSupply(),
    event.block.timestamp,
    event.block.number
  );
}