import {
  StrategyAdded as StrategyAddedEvent,
  StrategyReported as StrategyReportedEvent,
  Deposit1Call as DepositCall,
  Transfer as TransferEvent,
  Withdraw1Call as WithdrawCall,
  Vault as VaultContract,
} from '../../generated/Registry/Vault';
import {
  internalMapDeposit,
  internalMapTransfer,
  internalMapWithdrawal,
} from '../utils/vaultBalanceUpdates';
import { createEthTransaction } from '../utils/commons';
import { createStrategy, reportStrategy } from '../utils/strategy';

export function handleStrategyAdded(event: StrategyAddedEvent): void {
  let ethTransaction = createEthTransaction(event, 'StrategyAddedEvent');

  createStrategy(
    ethTransaction.id,
    event.params.strategy,
    event.transaction.from,
    event.params.debtLimit,
    event.params.rateLimit,
    event.params.performanceFee,
    event
  );
}

export function handleStrategyReported(event: StrategyReportedEvent): void {
  let ethTransaction = createEthTransaction(event, 'StrategyReportedEvent');
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
    event
  );
}

//  VAULT BALANCE UPDATES

export function handleDeposit(call: DepositCall): void {
  let vaultContract = VaultContract.bind(call.to);
  internalMapDeposit(
    call.transaction.hash,
    call.transaction.index,
    call.to,
    call.from,
    call.inputs._amount,
    vaultContract.totalAssets(),
    vaultContract.totalSupply(),
    vaultContract.pricePerShare(),
    call.block.timestamp,
    call.block.number
  );
}

export function handleWithdrawal(call: WithdrawCall): void {
  let vaultContract = VaultContract.bind(call.to);
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
  let vaultContract = VaultContract.bind(event.address);
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
