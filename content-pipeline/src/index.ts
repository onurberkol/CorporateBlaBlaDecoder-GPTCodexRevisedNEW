import { generateBatch } from './generate';
import { writeToFirestore, writeToJson } from './firestore';

function arg(name: string, fallback?: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
}

function todayUTC(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Etc/UTC' }).format(new Date());
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY');
    process.exit(1);
  }

  const start = arg('start', todayUTC())!;
  const days = parseInt(arg('days', '30')!, 10);
  const out = arg('out', 'json'); // 'json' | 'firestore'
  const file = arg('file', 'out/plaza.json')!;

  console.log(`\nGenerating ${days} Plaza cards from ${start} (${out})\n`);
  const docs = await generateBatch(start, days);

  if (out === 'firestore') {
    await writeToFirestore(docs);
    console.log(`\nWrote ${docs.length} cards to Firestore (dailyPlaza/*).`);
  } else {
    writeToJson(docs, file);
    console.log(`\nWrote ${docs.length} cards to ${file} (dry run).`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
