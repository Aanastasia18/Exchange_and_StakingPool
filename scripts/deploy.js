const hre = require('hardhat');
const ethers = hre.ethers;
const fs = require('fs');
const path = require('path');

async function main(){

    const INT = await ethers.getContractFactory("Token");
    const int = await INT.deploy(ethers.utils.parseEther('1000000'));
    await int.deployed();
    console.log(int.address);

    saveFrontendFiles({
        Token:int
    })

    function saveFrontendFiles(contracts) {
    const contractsDir = path.join(__dirname, '/..', 'src/contracts')

    if(!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir)
    }

    Object.entries(contracts).forEach((contract_item) => {
        const [name, contract] = contract_item

        if(contract) {
        fs.writeFileSync(
            path.join(contractsDir, '/', name + '-contract-address.json'),
            JSON.stringify({[name]: contract.address}, undefined, 2)
        )
        }

        const ContractArtifact = hre.artifacts.readArtifactSync(name)

        fs.writeFileSync(
        path.join(contractsDir, '/', name + ".json"),
        JSON.stringify(ContractArtifact, null, 2)
        )
    })
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
