import { useCallback, useEffect, useState } from 'react';
import * as utils from '../blockchain/utils';

const useMintData = () => {
 
  const [mintData, setMintData] = useState<any>(null);

  const fetchMintData = useCallback(async () => {
    try {
      const data = await utils.getPreMintData();
      setMintData(data);
      console.log(data)
      if ((window as any).debugMode)
        console.log("Mint Data:", data);
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    fetchMintData();
    let refreshInterval = setInterval(fetchMintData, 10000);
    return () => clearInterval(refreshInterval);
  }, [fetchMintData]);

  return mintData;
}

export default useMintData;
