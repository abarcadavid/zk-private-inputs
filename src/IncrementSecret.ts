import { Field, SmartContract, state, State, method, Poseidon } from 'snarkyjs';

export class IncrementSecret extends SmartContract {
  // This value will be stored on-chain
  @state(Field) onChainValue = State<Field>();

  // On contract creation, initialize value to be a hash
  @method initState(salt: Field, firstSecret: Field) {
    this.onChainValue.set(Poseidon.hash([salt, firstSecret]));
  }

  @method incrementSecret(salt: Field, secret: Field) {
    // Prove that the on-chain state is equal to recently grabbed state
    const x = this.onChainValue.get();
    this.onChainValue.assertEquals(x);

    // Assert that the secret arg will result in the same hash that was given
    // by the firstSecret arg given during contract creation.
    Poseidon.hash([salt, secret]).assertEquals(x);

    // User new the firstSecret, allow them to update current onChainValue
    this.onChainValue.set(Poseidon.hash([salt, secret.add(1)]));
  }
}
