import fs from 'fs';
import path from 'path';

interface ScriptData {
  level: string;
  module: string;
  title: string;
  persona: string;
  content: string;
  scenes: number;
}

function parseScriptFile(filePath: string): ScriptData | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    // Extract module ID and name from filename
    const match = fileName.match(/^(\d+)-(.+?)-roteiro\.md$/);
    if (!match) return null;
    
    const [, moduleId, moduleName] = match;
    const title = moduleName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    // Detect persona
    let persona = 'Desconhecida';
    if (content.includes('Sir Nexus Alencar') && content.includes('Sra. Nexus Ive')) {
      persona = 'dupla';
    } else if (content.includes('Sir Nexus Alencar')) {
      persona = 'Alencar';
    } else if (content.includes('Sra. Nexus Ive')) {
      persona = 'Ive';
    }
    
    // Count scenes
    const sceneMatches = content.match(/## Cena \d+/g) || [];
    const scenes = sceneMatches.length;
    
    return {
      level: '',
      module: moduleId,
      title,
      persona,
      content,
      scenes
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

function importScripts() {
  const basePath = '/home/ubuntu/MMN_AI-to-AI/AcademIA/cursos';
  const levels = ['fundamental', 'agente', 'master', 'elite'];
  const scripts: ScriptData[] = [];
  
  for (const level of levels) {
    const levelPath = path.join(basePath, level);
    if (!fs.existsSync(levelPath)) continue;
    
    const files = fs.readdirSync(levelPath).filter(f => f.endsWith('-roteiro.md'));
    
    for (const file of files) {
      const scriptData = parseScriptFile(path.join(levelPath, file));
      if (scriptData) {
        scriptData.level = level.charAt(0).toUpperCase() + level.slice(1);
        scripts.push(scriptData);
      }
    }
  }
  
  // Generate SQL insert statements
  console.log('-- Import Scripts from AcademIA');
  console.log('-- Generated:', new Date().toISOString());
  console.log('');
  
  scripts.forEach((script, index) => {
    const content = script.content.replace(/'/g, "\\'").replace(/\n/g, '\\n').substring(0, 65000);
    console.log(`-- ${script.level} - ${script.title}`);
    console.log(`INSERT INTO scripts (projectId, content, isEdited, createdAt, updatedAt) VALUES`);
    console.log(`(NULL, '${content}', 'false', NOW(), NOW());`);
    console.log('');
  });
  
  // Generate import manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    totalScripts: scripts.length,
    byLevel: {
      Fundamental: scripts.filter(s => s.level === 'Fundamental').length,
      Agente: scripts.filter(s => s.level === 'Agente').length,
      Master: scripts.filter(s => s.level === 'Master').length,
      Elite: scripts.filter(s => s.level === 'Elite').length,
    },
    scripts: scripts.map(s => ({
      level: s.level,
      module: s.module,
      title: s.title,
      persona: s.persona,
      scenes: s.scenes
    }))
  };
  
  fs.writeFileSync('/home/ubuntu/MMN_AI-to-AI/scripts_manifest.json', JSON.stringify(manifest, null, 2));
  console.log('\n-- Manifest saved to scripts_manifest.json');
}

importScripts();
