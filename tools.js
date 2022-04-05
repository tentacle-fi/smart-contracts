// 
// Tools for usage in this repo.
// Mainly, this will replace the extension 'truffle-export-abi' as we need more functionality
// 
// Specifically, collecting the ABI and the Bytecode from the compile operation is required.
// 
// save the Bytecode into bytecode.bin
// save the abi into abi.json
// 
// usage:
// 
// node tools.js PATH_TO_BUILD_JSON

const path = require('path')
const fs = require('fs').promises

async function main(args){
    if(args.length !== 3){
        console.error('expects args: node tools.js PATH_TO_BUILD_JSON')
    }
    const buildJsonFile = args[2]
    const inputFile = await readFile(buildJsonFile)

    let tmp = buildJsonFile.split(path.sep)
    const compiledFolderPath = path.join(tmp.shift(), 'compiled')

    // save abi.json
    await writeFile(path.join(compiledFolderPath, 'abi.json'), JSON.stringify(inputFile.abi))

    // save bytecode.bin
    await writeFile(path.join(compiledFolderPath, 'bytecode.bin'), inputFile.bytecode)
}

async function readFile(path){
    try{
        return await JSON.parse((await fs.readFile(path)).toString())
    }catch(e){
        console.error('unable to readFile',e)
    }
}

async function writeFile(path, contents){
    try{
        await fs.writeFile(path, contents)
    }catch(e){
        console.error('unable to writeFile', e)
    }
}

main(process.argv)