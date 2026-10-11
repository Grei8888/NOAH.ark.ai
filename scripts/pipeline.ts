import { runPipeline, type PipelineType } from '../lib/pipeline';
import { prisma } from '../lib/db/prisma';
const modes=['full','collect','process','generate-ark','breaking'];
const mode=process.argv[2]??'full';
if(!modes.includes(mode)) throw new Error('Invalid pipeline type');
runPipeline(mode as PipelineType,process.argv[3]).then(result=>console.log(JSON.stringify(result,null,2))).catch(error=>{console.error(error.message);process.exitCode=1;}).finally(()=>prisma.$disconnect());
