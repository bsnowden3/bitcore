import { BTCTxProvider } from '../btc';

export class DOGETxProvider extends BTCTxProvider {
  lib = require('bitcore-lib-doge');
  create({ recipients, utxos = [], change, wallet, fee = 20000 }) {
    change = change || wallet.deriveAddress(wallet.addressIndex, true);
    const filteredUtxos = this.selectCoins(recipients, utxos, fee);
    const btcUtxos = filteredUtxos.map(utxo => {
      const btcUtxo = Object.assign({}, utxo, {
        amount: utxo.value / 1e8,
        txid: utxo.mintTxid,
        outputIndex: utxo.mintIndex
      });
      return new this.lib.Transaction.UnspentOutput(btcUtxo);
    });
    let tx = new this.lib.Transaction().from(btcUtxos).feePerKb(Number(fee) + 2);
    if (change) {
      tx.change(change);
    }
    for (const recipient of recipients) {
      tx.to(recipient.address, parseInt(recipient.amount));
    }
    return tx.uncheckedSerialize();
  }
}
