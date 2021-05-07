import { log } from '@graphprotocol/graph-ts';
import {
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
  AddStrategyCall as AddStrategyV1Call,
  AddStrategy1Call as AddStrategyV2Call,
} from '../../generated/Registry/Vault';
import { printCallInfo } from '../utils/commons';
import { BIGINT_ZERO, ZERO_ADDRESS } from '../utils/constants';
import * as strategyLibrary from '../utils/strategy/strategy';
import {
  getOrCreateTransactionFromCall,
  getOrCreateTransactionFromEvent,
} from '../utils/transaction';
import * as vaultLibrary from '../utils/vault/vault';

export function handleAddStrategyV2(call: AddStrategyV2Call): void {
  if (vaultLibrary.isVault(call.to) && vaultLibrary.isVault(call.from)) {
    log.warning(
      'AddStrategyV2(...) - TX {} - Call to {} and call from {} are vaults (minimal proxy). Not processing addStrategy tx.',
      [
        call.transaction.hash.toHexString(),
        call.to.toHexString(),
        call.from.toHexString(),
      ]
    );
    return;
  }
  let ethTransaction = getOrCreateTransactionFromCall(
    call,
    'AddStrategyV2Call'
  );

  strategyLibrary.create(
    ethTransaction.id,
    call.inputs.strategy,
    call.to,
    call.inputs.debtRatio,
    BIGINT_ZERO,
    call.inputs.minDebtPerHarvest,
    call.inputs.maxDebtPerHarvest,
    call.inputs.performanceFee,
    ethTransaction
  );
}

export function handleAddStrategy(call: AddStrategyV1Call): void {
  if (vaultLibrary.isVault(call.to) && vaultLibrary.isVault(call.from)) {
    log.warning(
      'AddStrategy(...) - TX {} - Call to {} and call from {} are vaults (minimal proxy). Not processing addStrategy tx.',
      [
        call.transaction.hash.toHexString(),
        call.to.toHexString(),
        call.from.toHexString(),
      ]
    );
    return;
  }
  let ethTransaction = getOrCreateTransactionFromCall(call, 'AddStrategyCall');

  strategyLibrary.create(
    ethTransaction.id,
    call.inputs._strategy,
    call.to,
    call.inputs._debtLimit,
    call.inputs._rateLimit,
    BIGINT_ZERO,
    BIGINT_ZERO,
    call.inputs._performanceFee,
    ethTransaction
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
    vaultContract,
    vaultContractAddress,
    vaultContract.pricePerShare()
  );
}

//  VAULT BALANCE UPDATES

export function handleDeposit(call: DepositCall): void {
  log.debug('[Vault mappings] Handle deposit', []);

  if (vaultLibrary.isVault(call.to) && vaultLibrary.isVault(call.from)) {
    log.warning(
      'Deposit () - TX {} - Call to {} and call from {} are vaults (minimal proxy). Not processing deposit tx.',
      [
        call.transaction.hash.toHexString(),
        call.to.toHexString(),
        call.from.toHexString(),
      ]
    );
    return;
  }
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
    call.to,
    transaction,
    call.from,
    amount,
    call.outputs.value0
  );
}

export function handleDepositWithAmount(call: Deposit1Call): void {
  log.debug('[Vault mappings] Handle deposit with amount', []);
  if (vaultLibrary.isVault(call.to) && vaultLibrary.isVault(call.from)) {
    log.warning(
      'Deposit (amount) - TX {} - Call to {} and call from {} are vaults (minimal proxy). Not processing deposit tx.',
      [
        call.transaction.hash.toHexString(),
        call.to.toHexString(),
        call.from.toHexString(),
      ]
    );
    return;
  }
  let transaction = getOrCreateTransactionFromCall(call, 'vault.deposit(uint)');
  vaultLibrary.deposit(
    call.to, // Vault Address
    transaction,
    call.from,
    call.inputs._amount,
    call.outputs.value0
  );
}

export function handleDepositWithAmountAndRecipient(call: Deposit2Call): void {
  log.debug('[Vault mappings] Handle deposit with amount and recipient', []);
  if (vaultLibrary.isVault(call.to) && vaultLibrary.isVault(call.from)) {
    log.warning(
      'Deposit (amount,recipient) - TX {} - Call to {} and call from {} are vaults (minimal proxy). Not processing deposit tx.',
      [
        call.transaction.hash.toHexString(),
        call.to.toHexString(),
        call.from.toHexString(),
      ]
    );
    return;
  }
  let transaction = getOrCreateTransactionFromCall(
    call,
    'vault.deposit(uint,address)'
  );
  log.info(
    '[Vault mappings] Handle deposit(amount, recipient): TX: {} Vault address {} Amount: {} Recipient: {} From: {}',
    [
      call.transaction.hash.toHexString(),
      call.to.toHexString(),
      call.inputs._amount.toString(),
      call.inputs._recipient.toHexString(),
      call.from.toHexString(),
    ]
  );

  let blockNumber = call.block.number.toString();
  let txHash = call.transaction.hash.toHexString();
  log.info('TXDeposit {} block {} call.input.recipient {}', [
    txHash,
    blockNumber,
    call.inputs._recipient.toHexString(),
  ]);
  printCallInfo('TXDeposit', call);
  vaultLibrary.deposit(
    call.to, // Vault Address
    transaction,
    call.inputs._recipient, // Recipient
    call.inputs._amount,
    call.outputs.value0
  );
}

export function handleWithdraw(call: WithdrawCall): void {
  log.info('[Vault mappings] Handle withdraw. TX hash: {}', [
    call.transaction.hash.toHexString(),
  ]);
  if (vaultLibrary.isVault(call.to) && vaultLibrary.isVault(call.from)) {
    log.warning(
      'Withdraw (shares) - TX {} - Call to {} and call from {} are vaults (minimal proxy). Not processing withdraw tx.',
      [
        call.transaction.hash.toHexString(),
        call.to.toHexString(),
        call.from.toHexString(),
      ]
    );
    return;
  }
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
    call.to,
    call.from,
    withdrawnAmount,
    totalSharesBurnt,
    transaction
  );
}

export function handleWithdrawWithShares(call: Withdraw1Call): void {
  log.info('[Vault mappings] Handle withdraw with shares. TX hash: {}', [
    call.transaction.hash.toHexString(),
  ]);
  if (vaultLibrary.isVault(call.to) && vaultLibrary.isVault(call.from)) {
    log.warning(
      'Withdraw (shares) - TX {} - Call to {} and call from {} are vaults (minimal proxy). Not processing withdraw tx.',
      [
        call.transaction.hash.toHexString(),
        call.to.toHexString(),
        call.from.toHexString(),
      ]
    );
    return;
  }
  let transaction = getOrCreateTransactionFromCall(
    call,
    'vault.withdraw(uint256)'
  );
  log.info('[Vault mappings] Handle withdraw(shares): Vault address {}', [
    call.to.toHexString(),
  ]);

  vaultLibrary.withdraw(
    call.to,
    call.from,
    call.outputs.value0,
    call.inputs._shares,
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
  if (vaultLibrary.isVault(call.to) && vaultLibrary.isVault(call.from)) {
    log.warning(
      'Withdraw (shares,recipient) - TX {} - Call to {} and call from {} are vaults (minimal proxy). Not processing withdraw tx.',
      [
        call.transaction.hash.toHexString(),
        call.to.toHexString(),
        call.from.toHexString(),
        call.inputs._recipient.toHexString(),
      ]
    );
    return;
  }
  let transaction = getOrCreateTransactionFromCall(
    call,
    'vault.withdraw(uint256,address)'
  );
  log.info(
    '[Vault mappings] Handle withdraw(shares, recipient): TX: {} Vault address {} Shares: {} Recipient: {} From: {}',
    [
      call.transaction.hash.toHexString(),
      call.to.toHexString(),
      call.inputs._shares.toString(),
      call.inputs._recipient.toHexString(),
      call.from.toHexString(),
    ]
  );

  let blockNumber = call.block.number.toString();
  let txHash = call.transaction.hash.toHexString();
  log.info('TXWithdraw {} block {} call.input.recipient {}', [
    txHash,
    blockNumber,
    call.inputs._recipient.toHexString(),
  ]);
  printCallInfo('TXWithdraw', call);
  vaultLibrary.withdraw(
    call.to, // Vault Address
    call.from, // From
    call.outputs.value0,
    call.inputs._shares,
    transaction
  );
}

export function handleWithdrawWithSharesAndRecipientAndMaxLoss(
  call: Withdraw3Call
): void {
  log.info(
    '[Vault mappings] Handle withdraw with shares, recipient and max loss. TX hash: {}',
    [call.transaction.hash.toHexString()]
  );
  if (vaultLibrary.isVault(call.to) && vaultLibrary.isVault(call.from)) {
    log.warning(
      'Withdraw (shares,recipient,maxLoss) - TX {} - Call to {} and call from {} are vaults (minimal proxy). Not processing withdraw tx.',
      [
        call.transaction.hash.toHexString(),
        call.to.toHexString(),
        call.from.toHexString(),
        call.inputs.recipient.toHexString(),
      ]
    );
    return;
  }
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

  vaultLibrary.withdraw(
    call.to,
    call.from, // From
    call.outputs.value0,
    call.inputs.maxShares,
    transaction
  );
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
