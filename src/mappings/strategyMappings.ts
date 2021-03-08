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
import { Harvested } from "../../generated/templates/Vault/Strategy";
import { MAX_UINT } from "../utils/constants";
import * as strategyLibrary from "../utils/strategy"
import { getOrCreateTransactionFromCall, getOrCreateTransactionFromEvent } from "../utils/transaction";
import * as vaultLibrary from '../utils/vault/vault'

export function handleHarvested(event: Harvested): void {
  log.debug('[Strategy Mapping] Handle harvested', [])
  let ethTransaction = getOrCreateTransactionFromEvent(
    event, 
    "Harvest"
  )
}