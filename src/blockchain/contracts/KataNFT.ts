
import Contract from './Contract';
import abi from '../abis/KataNFT.json';

class KataNFT extends Contract {
  constructor(options, address) {
    super(options, "PreMint", abi, address);
  }
}

export default KataNFT;