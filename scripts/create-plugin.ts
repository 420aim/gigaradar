import * as fs from 'fs';
import * as path from 'path';


const TOOLS_DIR_NAME = 'tools'; 


const pluginName = process.argv[2];

if (!pluginName) {
    console.error('❌ Error: Lupa kasih nama plugin, bro.');
    console.log('➡️  Usage: npm run create-your-plugin <NamaPluginKeren>');
    process.exit(1);
}


const toolsDir = path.join(process.cwd(), 'src', TOOLS_DIR_NAME);
const pluginDir = path.join(toolsDir, pluginName);


const indexTemplate = `export * from "./${pluginName}";
`;

const toolTemplate = `import { SeiAgentKit } from "../../agent";
import { Address } from "viem";

/**
 * TODO: Tulis deskripsi singkat apa fungsi dari plugin ini.
 * @param agent Instance dari SeiAgentKit, gerbang utama ke blockchain.
 * @param someParameter TODO: Ganti nama dan tipe data parameter ini sesuai kebutuhan.
 * @returns TODO: Jelaskan apa yang akan dikembalikan oleh fungsi ini (misal: tx hash, data, dll).
 */`
export async function ${pluginName}(
  agent: SeiAgentKit,
  someParameter: string 
): Promise<any> {
  console.log(\`Executing ${pluginName} plugin with parameter: \${someParameter}\`);

  // TODO: Implement your degen logic here, ser.
  // Contoh:
  // const result = await agent.call(...);
  // atau
  // const txHash = await agent.sendTransaction(...);

  // Jangan lupa return sesuatu yang berguna!
  return { success: true, message: "WAGMI" };
}
`;


try {
    console.log(`🚀 Membuat plugin baru bernama '${pluginName}'...`);

    
    if (!fs.existsSync(toolsDir)) {
        fs.mkdirSync(toolsDir, { recursive: true });
    }

    
    if (!fs.existsSync(pluginDir)) {
        fs.mkdirSync(pluginDir);
        console.log(`📂 Direktori dibuat: ${pluginDir}`);
    } else {
        console.warn(`⚠️  Direktori '${pluginDir}' sudah ada, lanjut ke pembuatan file.`);
    }

    
    const indexPath = path.join(pluginDir, 'index.ts');
    fs.writeFileSync(indexPath, indexTemplate.trim());
    console.log(`✍️  File dibuat: ${indexPath}`);

    
    const toolPath = path.join(pluginDir, `${pluginName}.ts`);
    fs.writeFileSync(toolPath, toolTemplate.trim());
    console.log(`✍️  File dibuat: ${toolPath}`);

   
    const toolsIndexPath = path.join(toolsDir, 'index.ts');
    const exportStatement = `export * from "./${pluginName}";\n`;

    if (fs.existsSync(toolsIndexPath)) {
        const toolsIndexContent = fs.readFileSync(toolsIndexPath, 'utf8');
        if (!toolsIndexContent.includes(exportStatement.trim())) {
            fs.appendFileSync(toolsIndexPath, exportStatement);
            console.log(`🔗 Berhasil mendaftarkan '${pluginName}' di src/tools/index.ts`);
        } else {
            console.log(`✅ '${pluginName}' sudah terdaftar di src/tools/index.ts.`);
        }
    } else {
        fs.writeFileSync(toolsIndexPath, exportStatement);
        console.log(`✍️  File src/tools/index.ts dibuat dan '${pluginName}' berhasil didaftarkan.`);
    }

    console.log(`\n🎉 SUKSES! Plugin '${pluginName}' berhasil dibuat.`);
    console.log(`👉  Sekarang, buka src/tools/${pluginName}/${pluginName}.ts dan mulai ngoding!`);

} catch (error) {
    console.error('🔥 GAGAL TOTAL! Terjadi error saat membuat plugin:', error);
    process.exit(1);
}