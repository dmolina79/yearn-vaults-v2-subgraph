import { Address, log } from '@graphprotocol/graph-ts';
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
  Withdraw3Call,
} from '../../generated/Registry/Vault';
import { BIGINT_ZERO, ZERO_ADDRESS } from '../utils/constants';
import * as strategyLibrary from '../utils/strategy/strategy';
import {
  getOrCreateTransactionFromCall,
  getOrCreateTransactionFromEvent,
} from '../utils/transaction';
import * as vaultLibrary from '../utils/vault/vault';

export function handleStrategyAdded(event: StrategyAddedEvent): void {
  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'StrategyAddedEvent'
  );
  strategyLibrary.create(
    ethTransaction.id,
    event.params.strategy,
    event.address,
    event.params.debtLimit,
    event.params.rateLimit,
    event.params.performanceFee,
    event
  );
}

export function handleStrategyReported(event: StrategyReportedEvent): void {
  log.debug('[Vault mappings] Handle strategy reported', []);
  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'StrategyReportedEvent'
  );
  strategyLibrary.createReport(
    ethTransaction,
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

  log.info(
    '[Vault mappings] Updating price per share (strategy reported): {}',
    [event.transaction.hash.toHexString()]
  );
  let vaultContractAddress = event.address;
  let vaultContract = VaultContract.bind(vaultContractAddress);
  vaultLibrary.strategyReported(
    ethTransaction,
    vaultContractAddress,
    vaultContract.pricePerShare()
  );
}

//  VAULT BALANCE UPDATES

export function handleDeposit(call: DepositCall): void {
  log.debug('[Vault mappings] Handle deposit', []);
  let transaction = getOrCreateTransactionFromCall(call, 'vault.deposit()');
  let vaultContract = VaultContract.bind(call.to);
  let totalAssets = vaultContract.totalAssets();
  let totalSupply = vaultContract.totalSupply();
  let sharesAmount = call.outputs.value0;
  log.info(
    '[Vault mappings] Handle deposit() shares {} - total assets {} - total supply {}',
    [sharesAmount.toString(), totalAssets.toString(), totalSupply.toString()]
  );
  let amount = totalSupply.isZero()
    ? BIGINT_ZERO
    : sharesAmount.times(totalAssets).div(totalSupply);
  log.info('[Vault mappings] Handle deposit() shares {} - amount {}', [
    sharesAmount.toString(),
    amount.toString(),
  ]);
  vaultLibrary.deposit(
    vaultContract,
    transaction,
    call.from,
    call.to,
    amount,
    call.outputs.value0
  );
}

export function handleDepositWithAmount(call: Deposit1Call): void {
  log.debug('[Vault mappings] Handle deposit with amount', []);
  let transaction = getOrCreateTransactionFromCall(call, 'vault.deposit(uint)');
  let vaultContract = VaultContract.bind(call.to);
  vaultLibrary.deposit(
    vaultContract,
    transaction,
    call.from,
    call.to,
    call.inputs._amount,
    call.outputs.value0
  );
}

export function handleDepositWithAmountAndRecipient(call: Deposit2Call): void {
  log.debug('[Vault mappings] Handle deposit with amount and recipient', []);
  let transaction = getOrCreateTransactionFromCall(
    call,
    'vault.deposit(uint,address)'
  );
  let vaultContract = VaultContract.bind(call.to);
  vaultLibrary.deposit(
    vaultContract,
    transaction,
    call.inputs._recipient,
    call.to,
    call.inputs._amount,
    call.outputs.value0
  );
}

export function handleWithdraw(call: WithdrawCall): void {
  log.info('[Vault mappings] Handle withdraw. TX hash: {}', [
    call.transaction.hash.toHexString(),
  ]);
  let transaction = getOrCreateTransactionFromCall(call, 'vault.withdraw()');
  log.info('[Vault mappings] Handle withdraw(): Vault address {}', [
    call.to.toHexString(),
  ]);
  let vaultContract = VaultContract.bind(call.to);

  let withdrawnAmount = call.outputs.value0;
  let totalAssets = vaultContract.totalAssets();
  let totalSupply = vaultContract.totalSupply();
  let totalSharesBurnt = totalAssets.equals(BIGINT_ZERO)
    ? withdrawnAmount
    : withdrawnAmount.times(totalSupply).div(totalAssets);

  vaultLibrary.withdraw(
    vaultContract,
    call.from,
    call.to,
    withdrawnAmount,
    totalSharesBurnt,
    vaultContract.pricePerShare(),
    transaction
  );
}

export function handleWithdrawWithShares(call: Withdraw1Call): void {
  log.info('[Vault mappings] Handle withdraw with shares. TX hash: {}', [
    call.transaction.hash.toHexString(),
  ]);
  let transaction = getOrCreateTransactionFromCall(
    call,
    'vault.withdraw(uint256)'
  );
  log.info('[Vault mappings] Handle withdraw(shares): Vault address {}', [
    call.to.toHexString(),
  ]);
  let vaultContract = VaultContract.bind(call.to);

  vaultLibrary.withdraw(
    vaultContract,
    call.from,
    call.to,
    call.outputs.value0,
    call.inputs._shares,
    vaultContract.pricePerShare(),
    transaction
  );
}

export function handleWithdrawWithSharesAndRecipient(
  call: Withdraw2Call
): void {
  log.info(
    '[Vault mappings] Handle withdraw with shares and recipient. TX hash: {}',
    [call.transaction.hash.toHexString()]
  );
  let transaction = getOrCreateTransactionFromCall(
    call,
    'vault.withdraw(uint256,address)'
  );
  log.info(
    '[Vault mappings] Handle withdraw(shares, recipient): Vault address {}',
    [call.to.toHexString()]
  );
  log.info(
    'vault.withdraw(uint256,address) WITHDRAW TEST TX Hash {} From {} To {} recipient {}',
    [
      call.transaction.hash.toHexString(),
      call.from.toHexString(),
      call.to.toHexString(),
      call.inputs._recipient.toHexString(),
    ]
  );
  let vaultContract = VaultContract.bind(call.to);
  if (call.transaction.from !== call.inputs._recipient) {
    vaultLibrary.withdraw(
      vaultContract,
      call.transaction.to as Address, // Recipient
      call.to,
      call.outputs.value0,
      call.inputs._shares,
      vaultContract.pricePerShare(),
      transaction
    );
  } else {
    vaultLibrary.withdraw(
      vaultContract,
      call.inputs._recipient, // Recipient
      call.to,
      call.outputs.value0,
      call.inputs._shares,
      vaultContract.pricePerShare(),
      transaction
    );
  }
}

export function handleWithdrawWithSharesAndRecipientAndMaxLoss(
  call: Withdraw3Call
): void {
  log.info(
    '[Vault mappings] Handle withdraw with shares, recipient and max loss. TX hash: {}',
    [call.transaction.hash.toHexString()]
  );
  let transaction = getOrCreateTransactionFromCall(
    call,
    'vault.withdraw(uint256,address,uint256)'
  );
  log.info(
    '[Vault mappings] Handle withdraw(shares, recipient, maxLoss): Vault address {}',
    [call.to.toHexString()]
  );
  log.info(
    'vault.withdraw(uint256,address,maxLoss) WITHDRAW TEST TX Hash {} From {} To {} recipient {}',
    [
      call.transaction.hash.toHexString(),
      call.from.toHexString(),
      call.to.toHexString(),
      call.inputs.recipient.toHexString(),
    ]
  );
  let vaultContract = VaultContract.bind(call.to);
  if (call.transaction.from !== call.inputs.recipient) {
    vaultLibrary.withdraw(
      vaultContract,
      call.transaction.to as Address, // Recipient
      call.to,
      call.outputs.value0,
      call.inputs.maxShares,
      vaultContract.pricePerShare(),
      transaction
    );
  } else {
    vaultLibrary.withdraw(
      vaultContract,
      call.inputs.recipient, // Recipient
      call.to,
      call.outputs.value0,
      call.inputs.maxShares,
      vaultContract.pricePerShare(),
      transaction
    );
  }
}

export function handleTransfer(event: TransferEvent): void {
  log.info('[Vault mappings] Handle transfer: From: {} - To: {}. TX hash: {}', [
    event.params.sender.toHexString(),
    event.params.receiver.toHexString(),
    event.transaction.hash.toHexString(),
  ]);
  if (
    event.params.sender.toHexString() != ZERO_ADDRESS &&
    event.params.receiver.toHexString() != ZERO_ADDRESS
  ) {
    log.info(
      '[Vault mappings] Processing transfer: From: {} - To: {}. TX hash: {}',
      [
        event.params.sender.toHexString(),
        event.params.receiver.toHexString(),
        event.transaction.hash.toHexString(),
      ]
    );
    let transaction = getOrCreateTransactionFromEvent(
      event,
      'vault.transfer(address,uint256)'
    );
    let vaultContract = VaultContract.bind(event.address);
    let totalAssets = vaultContract.totalAssets();
    let totalSupply = vaultContract.totalSupply();
    let sharesAmount = event.params.value;
    let amount = sharesAmount.times(totalAssets).div(totalSupply);
    // share  = (amount * totalSupply) / totalAssets
    // amount = (shares * totalAssets) / totalSupply
    vaultLibrary.transfer(
      vaultContract,
      event.params.sender,
      event.params.receiver,
      amount,
      vaultContract.token(),
      sharesAmount,
      event.address,
      transaction
    );
  } else {
    log.info(
      '[Vault mappings] Not processing transfer: From: {} - To: {}. TX hash: {}',
      [
        event.params.sender.toHexString(),
        event.params.receiver.toHexString(),
        event.transaction.hash.toHexString(),
      ]
    );
  }
}
