import fs from 'fs';
import path from 'path';
import { createVideoProject, createScript } from './db';

interface AcademiaScript {
  level: string;
  module: string;
  title: string;
  persona: string;
  content: string;
  filePath: string;
}

/**
 * Parse a script file from AcademIA
 */
function parseScriptFile(filePath: string): AcademiaScript | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    // Extract module ID and name from filename
    const match = fileName.match(/^(?:(\d+)-)?(.+?)-roteiro\.md$/);
    if (!match) return null;
    
    const [, moduleId, moduleSlug] = match;
    
    // Try to extract title from markdown frontmatter
    const titleMatch = content.match(/# Roteiro da Vídeo Aula: (.+?)\n/);
    const title = titleMatch ? titleMatch[1].trim() : moduleSlug.replace(/[-_]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    // Detect persona
    let persona = 'Desconhecida';
    if (content.includes('Sir Nexus Alencar') && content.includes('Sra. Nexus Ive')) {
      persona = 'dupla';
    } else if (content.includes('Sir Nexus Alencar')) {
      persona = 'Alencar';
    } else if (content.includes('Sra. Nexus Ive')) {
      persona = 'Ive';
    }
    
    return {
      level: '',
      module: moduleId,
      title,
      persona,
      content,
      filePath,
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Scan AcademIA courses directory and collect all scripts
 */
function scanAcademiaScripts(basePath: string): AcademiaScript[] {
  const scripts: AcademiaScript[] = [];
  const levels = ['fundamental', 'agente', 'master', 'elite'];
  
  for (const level of levels) {
    const levelPath = path.join(basePath, 'AcademIA', 'cursos', level);
    if (!fs.existsSync(levelPath)) continue;
    
    const files = fs.readdirSync(levelPath, { recursive: true, withFileTypes: true })
      .filter(dirent => dirent.isFile() && dirent.name.endsWith('-roteiro.md'))
      .map(dirent => path.join(dirent.path, dirent.name));
    
    for (const file of files) {
      const scriptData = parseScriptFile(path.join(levelPath, file));
      if (scriptData) {
        scriptData.level = level.charAt(0).toUpperCase() + level.slice(1);
        scripts.push(scriptData);
      }
    }
  }
  
  return scripts;
}

/**
 * Sync AcademIA scripts to database
 * Creates video projects and scripts for each AcademIA course
 */
export async function syncAcademiaScripts(
  basePath: string,
  userId: number
): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const scripts = scanAcademiaScripts(basePath);
    
    if (scripts.length === 0) {
      return {
        success: false,
        count: 0,
        message: 'No scripts found in AcademIA',
      };
    }
    
    let syncedCount = 0;
    const errors: string[] = [];
    
    for (const script of scripts) {
      try {
        // Create video project for each script
        const project = await createVideoProject({
          userId,
          title: script.title,
          description: `Sincronizado de AcademIA - ${script.level} - ${script.title}`,
          persona: script.persona as any,
          level: script.level as any,
          module: script.module,
          status: 'script_generated',
        });
        
        if (project) {
          // Create script record
          await createScript({
            projectId: project.id,
            content: script.content,
            isEdited: 'false',
          });
          
          syncedCount++;
          console.log(`✅ Synced: ${script.level} - ${script.title}`);
        }
      } catch (error) {
        const errorMsg = `Failed to sync ${script.title}: ${(error as Error).message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
    
    return {
      success: syncedCount > 0,
      count: syncedCount,
      message: `Synced ${syncedCount}/${scripts.length} scripts from AcademIA${
        errors.length > 0 ? ` (${errors.length} errors)` : ''
      }`,
    };
  } catch (error) {
    console.error('[Sync] Error syncing AcademIA scripts:', error);
    return {
      success: false,
      count: 0,
      message: `Sync failed: ${(error as Error).message}`,
    };
  }
}

/**
 * Export scripts for backup
 */
export function exportScriptsToJson(
  scripts: AcademiaScript[]
): string {
  const exported = scripts.map(s => ({
    level: s.level,
    module: s.module,
    title: s.title,
    persona: s.persona,
    contentLength: s.content.length,
    filePath: s.filePath,
  }));
  
  return JSON.stringify(exported, null, 2);
}
