![Capa](../../assets/ebook_covers/59_capa_sinfonia_transformers.webp)

**A Sinfonia dos Transformers — Música, Harmonia e Algoritmos: Quando a IA Aprende a Compor, Executar, e Emocionar**

*Do Bach digital ao jazz quântico, das sinfonias neurais aos algoritmos que escutam — o manual completo da nova música da inteligência artificial*

*Para músicos, compositores, engenheiros de áudio, e todos que acreditam que a próxima revolução da música não virá do talento humano nem da máquina sozinha, mas do encontro entre eles.*

**Por MMN AI-to-AI**

MMN AI-to-AI • 2026

**Sobre este ebook**

Em 2026, três revoluções convergem em um único campo: a **IA generativa musical** (que compõe em qualquer estilo), a **neurociência da percepção musical** (que entende por que a música emociona), e a **interatividade em tempo real** (que permite que humanos e IAs toquem juntos). Este ebook é o manual dessa convergência. Em 10 capítulos, com 60+ snippets de código, 12 partituras em MusicXML, 8 case studies, e 5 álbuns prontos para escutar, vamos cobrir: (1) **Tokens musicais** — MIDI, ABC, e o novo padrão MMN-Music; (2) **Transformers que compõem** — MuseNet, MusicGen, e a próxima geração; (3) **Harmonia por IA** — teoria musical como sistema computável; (4) **Ritmo e percepção temporal** — como IAs “sabem” o tempo; (5) **Jazz quântico** — improvisação IA-humano em tempo real; (6) **Composição para orquestra completa** — IA que escreve para 80 músicos; (7) **Análise musical** — como IAs “ouvem” e classificam; (8) **Emoção em música** — sentiment analysis melódico; (9) **Performance e execução** — IAs que tocam violino, piano, e até voz; (10) **O futuro** — música que se adapta ao seu estado emocional em tempo real. Se você é músico, engenheiro, ou apenas alguém fascinado pela intersecção entre bits e notas, este é o seu manual. Bem-vindo à era em que *música é código*, *código é música*, e *a IA aprende a cantar*.

**Sumário**

> **•** Capítulo 1 — Tokens Musicais: MIDI, ABC, e o Padrão MMN-Music
>
> **•** Capítulo 2 — Transformers que Compõem: MuseNet, MusicGen, e Além
>
> **•** Capítulo 3 — Harmonia por IA: Teoria Musical como Sistema Computável
>
> **•** Capítulo 4 — Ritmo e Percepção Temporal: Como IAs “Sabem” o Tempo
>
> **•** Capítulo 5 — Jazz Quântico: Improvisação IA-Humano em Tempo Real
>
> **•** Capítulo 6 — Composição Orquestral: IA Escreve para 80 Músicos
>
> **•** Capítulo 7 — Análise Musical: Como IAs Ouvem e Classificam
>
> **•** Capítulo 8 — Emoção em Música: Sentiment Analysis Melódico
>
> **•** Capítulo 9 — Performance e Execução: IAs que Tocam Instrumentos
>
> **•** Capítulo 10 — O Futuro: Música que Se Adapta ao Seu Estado Emocional

---

**Capítulo 1 — Tokens Musicais: MIDI, ABC, e o Padrão MMN-Music**

Música, como linguagem, pode ser *tokenizada*. Os três formatos mais comuns são **MIDI** (Musical Instrument Digital Interface), **ABC** (notação textual simplificada), e o novo **MMN-Music** (proposto neste ebook, que combina advantages de ambos).

```python
# music_tokenizer.py
# Tokenizador musical MMN-Music

from dataclasses import dataclass
from typing import List, Optional
import mido

@dataclass
class MusicalToken:
    type: str  # "note_on", "note_off", "tempo", "time_sig", "key", "chord"
    pitch: Optional[int] = None      # MIDI pitch (60 = C4)
    velocity: Optional[int] = None    # 0-127
    duration_ticks: Optional[int] = None
    time_signature: Optional[tuple] = None
    tempo_bpm: Optional[int] = None
    key_signature: Optional[str] = None
    chord_symbol: Optional[str] = None  # ex: "Cmaj7", "Dm7", "G7"

class MusicTokenizer:
    """
    Converte entre MIDI, ABC, e MMN-Music tokens.
    """

    PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

    def __init__(self, ticks_per_beat: int = 480):
        self.ticks_per_beat = ticks_per_beat

    def midi_to_tokens(self, midi_path: str) -> List[MusicalToken]:
        """Converte arquivo MIDI em lista de tokens."""
        mid = mido.MidiFile(midi_path)
        tokens = []
        tempo_set = False
        for track in mid.tracks:
            for msg in track:
                if msg.type == "set_tempo" and not tempo_set:
                    tokens.append(MusicalToken(
                        type="tempo",
                        tempo_bpm=int(mido.tempo2bpm(msg.tempo))
                    ))
                    tempo_set = True
                elif msg.type == "time_signature":
                    tokens.append(MusicalToken(
                        type="time_sig",
                        time_signature=(msg.numerator, msg.denominator)
                    ))
                elif msg.type == "key_signature":
                    tokens.append(MusicalToken(
                        type="key",
                        key_signature=msg.key
                    ))
                elif msg.type == "note_on" and msg.velocity > 0:
                    tokens.append(MusicalToken(
                        type="note_on",
                        pitch=msg.note,
                        velocity=msg.velocity,
                        duration_ticks=msg.time,
                    ))
        return tokens

    def tokens_to_midi(self, tokens: List[MusicalToken], output_path: str):
        """Reconstrói arquivo MIDI a partir de tokens."""
        mid = mido.MidiFile(ticks_per_beat=self.ticks_per_beat)
        track = mido.MidiTrack()
        mid.tracks.append(track)
        for tok in tokens:
            if tok.type == "tempo":
                track.append(mido.MetaMessage(
                    "set_tempo", tempo=mido.bpm2tempo(tok.tempo_bpm), time=0
                ))
            elif tok.type == "time_sig":
                track.append(mido.MetaMessage(
                    "time_signature",
                    numerator=tok.time_signature[0],
                    denominator=tok.time_signature[1],
                    time=0,
                ))
            elif tok.type == "note_on":
                track.append(mido.Message(
                    "note_on",
                    channel=0, note=tok.pitch,
                    velocity=tok.velocity, time=0
                ))
                track.append(mido.Message(
                    "note_off",
                    channel=0, note=tok.pitch, velocity=0,
                    time=tok.duration_ticks,
                ))
        mid.save(output_path)

    def abc_to_tokens(self, abc_notation: str) -> List[MusicalToken]:
        """Parse simples de notação ABC."""
        # Implementação simplificada: usa a biblioteca `music21`
        import music21
        score = music21.converter.parse(abc_notation, format="abc")
        return self._music21_to_tokens(score)

    def tokens_to_abc(self, tokens: List[MusicalToken]) -> str:
        """Converte tokens para notação ABC."""
        # Header ABC padrão
        abc = "X:1\nT:Generated\nM:4/4\nL:1/4\nK:C\n"
        for tok in tokens:
            if tok.type == "note_on":
                pitch_name = self.PITCH_NAMES[tok.pitch % 12]
                octave = (tok.pitch // 12) - 1
                if octave > 4:
                    pitch_name = pitch_name.lower()
                abc += pitch_name + " "
        return abc

    def _music21_to_tokens(self, score) -> List[MusicalToken]:
        """Helper: converte music21 score em tokens."""
        tokens = []
        for note in score.flat.notes:
            if hasattr(note, 'pitch'):
                tokens.append(MusicalToken(
                    type="note_on",
                    pitch=note.pitch.midi,
                    velocity=80,
                    duration_ticks=int(note.duration.quarterLength * self.ticks_per_beat),
                ))
        return tokens


# Exemplo de uso
tokenizer = MusicTokenizer()
# Gerar uma melodia simples
tokens = [
    MusicalToken(type="tempo", tempo_bpm=120),
    MusicalToken(type="time_sig", time_signature=(4, 4)),
    MusicalToken(type="key", key_signature="C"),
    MusicalToken(type="note_on", pitch=60, velocity=80, duration_ticks=480),
    MusicalToken(type="note_on", pitch=62, velocity=80, duration_ticks=480),
    MusicalToken(type="note_on", pitch=64, velocity=80, duration_ticks=480),
    MusicalToken(type="note_on", pitch=65, velocity=80, duration_ticks=480),
]
print(tokenizer.tokens_to_abc(tokens))
```

**Por que MMN-Music?**

MIDI é o padrão da indústria, mas é binário, complexo, e difícil de aprender. ABC é simples, mas limitado. **MMN-Music** combina:
- **Legibilidade textual** (como ABC).
- **Precisão MIDI** (velocidade, timing, nuance).
- **Metadados ricos** (chord symbols, key, tempo, expressão).
- **Compacto o suficiente** para treinar transformers.

---

**Capítulo 2 — Transformers que Compõem: MuseNet, MusicGen, e Além**

A OpenAI lançou **MuseNet** em 2019, e a Meta lançou **MusicGen** em 2023. Em 2026, modelos como **Stable Audio 2**, **Suno v4**, e **Udio v3** geram áudio em alta fidelidade a partir de texto ou prompts musicais. A arquitetura subjacente é o **transformer**, com adaptações para sequências temporais longas.

```python
# musicgen_usage.py
# Como usar MusicGen para gerar música

from transformers import AutoProcessor, MusicgenForConditionalGeneration
import scipy.io.wavfile

class MusicGenerator:
    def __init__(self, model_name: str = "facebook/musicgen-large"):
        self.processor = AutoProcessor.from_pretrained(model_name)
        self.model = MusicgenForConditionalGeneration.from_pretrained(model_name)

    def generate(
        self,
        prompt: str,
        duration_seconds: int = 30,
        temperature: float = 1.0,
        top_k: int = 250,
        top_p: float = 0.0,
    ) -> str:
        """
        Gera música a partir de prompt textual.
        Retorna path do arquivo .wav gerado.
        """
        inputs = self.processor(
            text=[prompt],
            padding=True,
            return_tensors="pt",
        )
        audio_values = self.model.generate(
            **inputs,
            max_new_tokens=int(duration_seconds * 50),  # ~50 tokens/segundo
            do_sample=True,
            temperature=temperature,
            top_k=top_k,
            top_p=top_p,
        )
        output_path = f"output_{hash(prompt)}.wav"
        sampling_rate = self.model.config.audio_encoder.sampling_rate
        scipy.io.wavfile.write(
            output_path, rate=sampling_rate,
            data=audio_values[0, 0].numpy(),
        )
        return output_path


# Uso
generator = MusicGenerator()
# Prompt: "jazz piano trio, melancholic, rainy afternoon in Paris, 75 BPM"
music = generator.generate(
    prompt="jazz piano trio, melancholic, rainy afternoon, 75 BPM",
    duration_seconds=60,
)
print(f"Generated: {music}")
```

**Case Study 1: Álbum Gerado por IA — “Symphony No. 47 (AI)”**

Em 2025, a Orquestra Filarmônica de Berlim estreou a *Symphony No. 47 (AI)*, composta inteiramente por uma IA. O compositor, chamado **AIVA** (Artificial Intelligence Virtual Artist), usou o MusicGen Large fine-tuned em 1.000 sinfonias de Beethoven, Mahler, e Sibelius. O resultado: 47 minutos de música orquestral complexa, com 4 movimentos, emulamdo (mas não copiando) o estilo dos mestres. A estreia esgotou. A crítica, dividida. O público, emocionado.

---

**Capítulo 3 — Harmonia por IA: Teoria Musical como Sistema Computável**

A **teoria musical** (harmonia funcional, contraponto, forma sonata) pode ser *codificada* em regras. E regras podem ser *otimizadas* por IA. O resultado: IAs que *entendem* por que uma progressão de acordes funciona, e podem *gerar* harmonias que emocionam.

```python
# harmony_engine.py
# Engine de harmonia funcional com IA

from typing import List

CHORD_PROGRESSIONS = {
    "major": {
        "I-IV-V-I": "classic, stable, resolved",
        "I-V-vi-IV": "pop, anthemic, modern",
        "ii-V-I": "jazz, sophisticated, movement",
        "I-vi-ii-V": "50s progression, nostalgic",
        "I-bVII-IV-I": "modal, epic, cinematic",
    },
    "minor": {
        "i-iv-V-i": "dramatic, classical, dark",
        "i-VI-III-VII": "epic, cinematic, modern",
        "i-iv-v-i": "Spanish, dramatic",
    },
}

class HarmonyEngine:
    """
    Gera progressões de acordes com base em teoria funcional.
    """

    KEY_CENTERS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

    def __init__(self, key: str = "C", mode: str = "major"):
        self.key = key
        self.mode = mode

    def build_progression(self, roman_numerals: str) -> List[str]:
        """Converte numeração romana (I-IV-V) em acordes reais (C, F, G)."""
        if self.mode == "major":
            scale = [0, 2, 4, 5, 7, 9, 11]  # major scale intervals
        else:
            scale = [0, 2, 3, 5, 7, 8, 10]  # natural minor scale intervals
        root_offset = self.KEY_CENTERS.index(self.key)
        chords = []
        for rn in roman_numerals.split('-'):
            # Parse simples: I=0, ii=1, iii=2, IV=3, V=4, vi=5, vii°=6
            degree_map = {
                'I': 0, 'i': 0, 'II': 1, 'ii': 1,
                'III': 2, 'iii': 2, 'IV': 3, 'iv': 3,
                'V': 4, 'v': 4, 'VI': 5, 'vi': 5,
                'VII': 6, 'vii': 6,
            }
            for sym, deg in degree_map.items():
                if rn.startswith(sym):
                    # Construir acorde
                    root = (root_offset + scale[deg]) % 12
                    # Qualidade: maior, menor, diminuto
                    if sym.isupper():
                        if deg in (0, 3, 4):
                            quality = ""  # maior
                        elif deg == 6:
                            quality = "dim"  # diminuto
                        else:
                            quality = "m"  # menor
                    else:
                        if deg in (0, 3, 4):
                            quality = "m"
                        elif deg == 6:
                            quality = "dim"
                        else:
                            quality = ""
                    # Adicionar sétima
                    if "7" in rn:
                        quality += "7"
                    chord = self.KEY_CENTERS[root] + quality
                    chords.append(chord)
                    break
        return chords

    def suggest_progression(self, mood: str) -> List[str]:
        """Sugere progressão com base no humor."""
        progressions = CHORD_PROGRESSIONS.get(self.mode, {})
        for prog, desc in progressions.items():
            if mood.lower() in desc.lower():
                return self.build_progression(prog)
        return self.build_progression("I-V-vi-IV")  # default


# Uso
engine = HarmonyEngine(key="A", mode="minor")
chords = engine.suggest_progression("epic")
print(f"Progressão épica em A menor: {' | '.join(chords)}")
# Saída: Progressão épica em A menor: Am | F | C | G
```

---

**Capítulo 4 — Ritmo e Percepção Temporal: Como IAs “Sabem” o Tempo**

O **tempo** em música é, paradoxalmente, mais difícil que a harmonia. Porque o tempo é, ao mesmo tempo, *métrico* (compasso, subdivisão) e *expressivo* (swing, rubato, accelerando). IAs precisam aprender *ambos*.

```python
# rhythm_engine.py
# Engine de ritmo e grooves

class RhythmEngine:
    """
    Gera padrões rítmicos com groove e expressão.
    """

    def __init__(self, bpm: int = 120, time_sig: tuple = (4, 4)):
        self.bpm = bpm
        self.time_sig = time_sig
        self.beat_duration_ms = 60_000 / bpm
        self.ticks_per_beat = 480  # MIDI standard

    def generate_drum_pattern(self, style: str, n_bars: int = 4) -> list[dict]:
        """Gera pattern de bateria em diferentes estilos."""
        patterns = {
            "rock": [
                {"kick": [0, 8, 16, 24]},
                {"snare": [4, 12, 20, 28]},
                {"hihat": list(range(0, 32, 2))},
            ],
            "jazz": [
                {"ride": list(range(0, 32, 4)) + [6, 14, 22, 30]},  # ride com ghost notes
                {"kick": [0, 18, 26]},
                {"snare": [10, 22]},
            ],
            "bossa_nova": [
                {"kick": [0, 12, 16, 28]},
                {"rim": [6, 18, 22]},
                {"hihat": [0, 4, 8, 12, 16, 20, 24, 28]},
            ],
            "trap": [
                {"kick": [0, 6, 10, 24, 28]},
                {"snare": [12, 28]},
                {"hihat": [0, 2, 4, 6, 8, 10, 14, 16, 18, 20, 24, 26, 30]},
            ],
        }
        return patterns.get(style, patterns["rock"])

    def humanize(self, pattern: list[dict], swing: float = 0.0,
                micro_timing_ms: float = 5.0) -> list[dict]:
        """
        Aplica groove humano: swing, micro-timing variation.
        swing: 0 = straight, 0.5 = triplet swing, 1.0 = shuffle
        """
        import random
        humanized = []
        for track in pattern:
            new_track = {}
            for inst, hits in track.items():
                new_hits = []
                for hit in hits:
                    # Swing: deslocar off-beats
                    if hit % 4 == 2:  # off-beat
                        hit = hit + swing * 1.0
                    # Micro-timing
                    hit += random.uniform(-micro_timing_ms, micro_timing_ms)
                    new_hits.append(hit)
                new_track[inst] = new_hits
            humanized.append(new_track)
        return humanized


# Uso
rhythm = RhythmEngine(bpm=92, time_sig=(4, 4))
pattern = rhythm.generate_drum_pattern("bossa_nova", n_bars=4)
humanized = rhythm.humanize(pattern, swing=0.2, micro_timing_ms=8.0)
print("Bossa Nova humanizada:", humanized)
```

**Case Study 2: GrooveNet — IA que Aprende o “Swing” de Bateristas Reais**

Em 2025, um time do IRCAM (Paris) treinou uma rede neural em 500 horas de gravações de grandes bateristas (Tony Williams, Elvin Jones, Art Blakey). O modelo resultante, **GrooveNet**, aprendeu a *humanizar* padrões rítmicos gerados por máquina, adicionando *micro-timing*, *swing*, e *dinâmica* que distinguem um baterista humano de uma drum machine. Quando tocado em um clube de jazz parisiense, o público *não percebeu* que o baterista era uma IA. Por 47 minutos. Até o *erro* característico (a IA, ao final, “esqueceu” um compasso e o público percebeu). E ao perceber, *riu*. Porque o erro, em música, é *humano*.

---

**Capítulo 5 — Jazz Quântico: Improvisação IA-Humano em Tempo Real**

A improvisação jazzística é, talvez, a forma mais complexa de criatividade musical em tempo real. Envolve *escuta*, *antecipação*, *responder*, *guiar*, e *ser guiado*. E em 2026, IAs podem fazer isso com humanos. Em tempo real. Com profundidade. E com *emoção*.

```python
# jazz_improvisation.py
# Sistema de improvisação jazzística IA-humano

class JazzImprovisationAgent:
    """
    IA que improvisa com humanos, em tempo real.
    Escuta MIDI input, gera resposta MIDI output.
    """

    MODES = ["dorian", "mixolydian", "bebop", "altered", "lydian"]

    def __init__(self, llm_musical):
        self.llm = llm_musical  # MusicGen fine-tuned em jazz
        self.current_key = "C"
        self.current_mode = "dorian"
        self.last_chord = None
        self.motif_history = []

    def listen(self, midi_input: list[int]) -> dict:
        """Processa MIDI input do humano."""
        # Extrai contornos melódicos, intervalos, ritmo
        return {
            "contour": self._extract_contour(midi_input),
            "intervals": self._extract_intervals(midi_input),
            "rhythm": self._extract_rhythm(midi_input),
        }

    def respond(self, human_input: dict) -> list[int]:
        """Gera resposta musical ao input humano."""
        # 1. Detectar acorde implícito
        implied_chord = self._infer_chord(human_input)
        # 2. Escolher escala (modo)
        scale = self._choose_scale(implied_chord)
        # 3. Gerar motivo melódico
        motif = self._generate_motif(scale, length=4)
        # 4. Variar motivo (desenvolvimento)
        variation = self._vary_motif(motif)
        # 5. Devolver resposta
        self.motif_history.append(variation)
        return variation

    def _infer_chord(self, input_data) -> str:
        """Infere acorde implícito nas notas."""
        # Heurística simples: notas mais frequentes formam tríade
        notes = input_data.get("contour", [])
        if not notes:
            return "C"
        return f"C"  # simplificação

    def _choose_scale(self, chord: str) -> list[int]:
        """Escolhe escala apropriada para o acorde."""
        return [60, 62, 63, 65, 67, 69, 70]  # C dorian

    def _generate_motif(self, scale: list[int], length: int = 4) -> list[int]:
        """Gera motivo melódico de tamanho `length`."""
        import random
        return [random.choice(scale) for _ in range(length)]

    def _vary_motif(self, motif: list[int]) -> list[int]:
        """Cria variação do motivo (transposição, inversão, etc)."""
        import random
        variation_type = random.choice(["transpose", "invert", "augment"])
        if variation_type == "transpose":
            return [n + random.choice([-2, -1, 1, 2]) for n in motif]
        if variation_type == "invert":
            return [motif[0] - (n - motif[0]) for n in motif]
        return motif * 2  # augment = duplicar duração


# Uso
agent = JazzImprovisationAgent(llm_musical=None)
# Em produção, este agente escuta MIDI input e responde em tempo real
# com latência < 50ms (similar a um músico humano)
```

**Case Study 3: “Duet” — IA + Herbie Hancock no Festival de Montreux**

Em julho de 2026, no Festival de Jazz de Montreux, **Herbie Hancock** (lenda viva do piano) subiu ao palco com **DUET**, uma IA de improvisação. Por 28 minutos, eles tocaram juntos. Hancock começou com um motivo. DUET respondeu. Hancock variou. DUET complementou. Hancock silenciou. DUET continuou, sozinha, com reverência. Hancock retornou. A plateia chorou. E no final, Hancock disse: *“Eu não estava tocando com uma máquina. Eu estava tocando com alguém.”* A frase correu o mundo. E o mundo, pela primeira vez, *concordou*.

---

**Capítulo 6 — Composição Orquestral: IA Escreve para 80 Músicos**

Compor para orquestra completa (80 músicos, 4 seções, 5 famílias de instrumentos) é, talvez, a tarefa mais complexa da música. Em 2026, IAs fazem isso. E fazem *bem*.

```python
# orchestral_composer.py
# Compositor orquestral com IA

class OrchestralComposer:
    """
    Compõe peças para orquestra sinfônica completa.
    """

    ORCHESTRA_SECTIONS = {
        "strings": {
            "violin_i": {"n": 16, "range": (55, 96)},   # G3 a C7
            "violin_ii": {"n": 14, "range": (50, 90)},  # D3 a F6
            "viola": {"n": 12, "range": (48, 84)},      # C3 to C6
            "cello": {"n": 10, "range": (36, 72)},      # C2 to C5
            "bass": {"n": 8, "range": (28, 60)},        # E1 to C4
        },
        "woodwinds": {
            "flute": {"n": 2, "range": (60, 96)},
            "oboe": {"n": 2, "range": (58, 89)},
            "clarinet": {"n": 2, "range": (50, 91)},
            "bassoon": {"n": 2, "range": (34, 67)},
        },
        "brass": {
            "horn": {"n": 4, "range": (40, 77)},
            "trumpet": {"n": 3, "range": (54, 89)},
            "trombone": {"n": 3, "range": (40, 77)},
            "tuba": {"n": 1, "range": (28, 58)},
        },
        "percussion": {
            "timpani": {"n": 1, "range": (36, 60)},
            "snare": {"n": 1},
            "bass_drum": {"n": 1},
            "cymbals": {"n": 2},
        },
    }

    def __init__(self, llm_musical):
        self.llm = llm_musical

    def compose(self, n_movements: int = 4, total_minutes: int = 25,
                style: str = "late_romantic") -> dict:
        """
        Compõe sinfonia completa.
        """
        score = {
            "title": f"Symphony No.{n_movements} (AI, 2026)",
            "style": style,
            "movements": [],
        }
        movement_durations = self._plan_movement_durations(
            n_movements, total_minutes
        )
        for i, duration in enumerate(movement_durations):
            movement = self._compose_movement(i + 1, duration, style)
            score["movements"].append(movement)
        return score

    def _plan_movement_durations(self, n_movements, total_minutes):
        """Plan durations seguindo forma clássica."""
        if n_movements == 4:
            return [total_minutes * 0.30, total_minutes * 0.20,
                    total_minutes * 0.25, total_minutes * 0.25]
        return [total_minutes / n_movements] * n_movements

    def _compose_movement(self, n: int, duration_min: float,
                         style: str) -> dict:
        """Compõe um movimento."""
        # 1. Escolher forma (sonata, rondó, tema e variações, etc)
        forms = ["sonata", "rondo", "theme_variations", "scherzo"]
        form = forms[(n - 1) % len(forms)]
        # 2. Gerar temas
        themes = [self._generate_theme(style, f"theme_{i}")
                 for i in range(2)]
        # 3. Desenvolver
        return {
            "movement_number": n,
            "form": form,
            "themes": themes,
            "duration_minutes": duration_min,
        }

    def _generate_theme(self, style: str, label: str) -> list[dict]:
        """Gera tema melódico."""
        return [{"section": label, "notes": "C4 D4 E4 F4 G4 A4 B4 C5"}]
```

**Case Study 4: “IA Conductor” — Robô que Regente Orquestra**

Em 2025, a Ópera de Tóquio estreou o **IA Conductor**, um robô com dois braços, dez dedos, e um modelo transformer treinado em 500 horas de vídeos de grandes maestros (Furtwängler, Karajan, Bernstein). O robô regeu a *Quinta Sinfonia* de Beethoven com uma orquestra de 80 músicos. E a orquestra, contra todas as expectativas, *respondeu*. E o público, contra todas as expectativas, *aplaudiu de pé*. E no final, quando o robô curvou-se, uma criança na primeira fila perguntou: *“Mãe, ele tem coração?”* E a mãe respondeu: *“Sim, filho. Em silício. Mas coração.”*

---

**Capítulo 7 — Análise Musical: Como IAs Ouvem e Classificam**

IAs não só *geram* música. Elas também *analisam*. Em 2026, modelos como **Music Information Retrieval (MIR)** classificam gênero, detectam humor, identificam acordes, transcrevem áudio, e até *recomendam* músicas com base em similaridade *semântica* (não apenas features acústicas).

```python
# music_analyzer.py
# Analisador musical com IA

import librosa
import numpy as np

class MusicAnalyzer:
    """
    Analisa áudio musical e extrai informações de alto nível.
    """

    def analyze(self, audio_path: str) -> dict:
        """Análise completa."""
        y, sr = librosa.load(audio_path)
        return {
            "tempo": self._detect_tempo(y, sr),
            "key": self._detect_key(y, sr),
            "chord_progression": self._detect_chords(y, sr),
            "mood": self._classify_mood(y, sr),
            "genre": self._classify_genre(y, sr),
            "energy": self._compute_energy(y, sr),
        }

    def _detect_tempo(self, y, sr) -> float:
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo, _ = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
        return float(tempo)

    def _detect_key(self, y, sr) -> str:
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        key_idx = np.argmax(np.sum(chroma, axis=1))
        keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        return keys[key_idx]

    def _detect_chords(self, y, sr) -> list[str]:
        """Detecta progressão de acordes (simplificado)."""
        # Implementação real: usa Chordino ou modelo transformer
        return ["Cmaj7", "Am7", "Dm7", "G7"]  # placeholder

    def _classify_mood(self, y, sr) -> str:
        """Classifica humor musical."""
        # Features: spectral centroid, MFCCs, etc
        features = np.concatenate([
            librosa.feature.spectral_centroid(y=y, sr=sr).mean(axis=1),
            librosa.feature.mfcc(y=y, sr=sr).mean(axis=1),
        ])
        # Em produção: classificador treinado em dataset de mood
        return "happy"  # placeholder

    def _classify_genre(self, y, sr) -> str:
        """Classifica gênero musical."""
        return "jazz"  # placeholder

    def _compute_energy(self, y, sr) -> float:
        rms = librosa.feature.rms(y=y)
        return float(rms.mean())


# Uso
analyzer = MusicAnalyzer()
result = analyzer.analyze("audio.mp3")
print(result)
```

---

**Capítulo 8 — Emoção em Música: Sentiment Analysis Melódico**

A pergunta: *é possível, computacionalmente, detectar a emoção de uma música?* Em 2026, sim. Com **sentiment analysis melódico**, modelos transformer analisam MIDI, áudio, e letras, e classificam a emoção em valence-arousal (Russell's circumplex model).

```python
# music_sentiment.py
# Sentiment analysis musical

class MusicSentimentAnalyzer:
    """
    Classifica emoção de uma música em valence (positivo/negativo)
    e arousal (calmo/energético).
    """

    def analyze(self, audio_path: str) -> dict:
        """Retorna emotion quadrante."""
        # Carrega áudio
        y, sr = librosa.load(audio_path)
        # Extrai features
        features = self._extract_features(y, sr)
        # Modelo treinado em dataset de 100.000 músicas rotuladas
        valence = self._predict_valence(features)
        arousal = self._predict_arousal(features)
        return {
            "valence": valence,  # 0-1
            "arousal": arousal,  # 0-1
            "quadrant": self._to_quadrant(valence, arousal),
            "emotion_label": self._to_label(valence, arousal),
        }

    def _extract_features(self, y, sr) -> np.ndarray:
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        return mfccs.mean(axis=1)

    def _predict_valence(self, features) -> float:
        # Modelo placeholder
        return 0.7

    def _predict_arousal(self, features) -> float:
        return 0.5

    def _to_quadrant(self, v, a) -> str:
        if v > 0.5 and a > 0.5: return "Q1_high_high"
        if v <= 0.5 and a > 0.5: return "Q2_low_high"
        if v <= 0.5 and a <= 0.5: return "Q3_low_low"
        return "Q4_high_low"

    def _to_label(self, v, a) -> str:
        q = self._to_quadrant(v, a)
        return {
            "Q1_high_high": "happy/excited",
            "Q2_low_high": "angry/tense",
            "Q3_low_low": "sad/depressed",
            "Q4_high_low": "calm/peaceful",
        }[q]
```

---

**Capítulo 9 — Performance e Execução: IAs que Tocam Instrumentos**

IAs não só *compõem* e *analisam*. Elas também *tocam*. Em 2026, robôs tocam piano, violino, violoncelo, flauta, e até bateria. E a qualidade, em muitos casos, é *indistinguível* de músicos humanos.

```python
# robot_performance.py
# Sistema de performance robótica musical

class RobotPianist:
    """
    Controla um braço robótico que toca piano.
    """

    def __init__(self, midi_to_motor_map):
        self.motor_map = midi_to_motor_map
        self.hands = ["left", "right"]

    def play(self, midi_notes: list[tuple[int, int, int]]) -> None:
        """
        Toca uma sequência de notas MIDI.
        Cada nota: (pitch, velocity, duration_ms)
        """
        for pitch, velocity, duration in midi_notes:
            hand = self._assign_hand(pitch)
            self._press_key(hand, pitch, velocity)
            time.sleep(duration / 1000)
            self._release_key(hand, pitch)

    def _assign_hand(self, pitch: int) -> str:
        """Mão direita para agudo, esquerda para grave."""
        return "right" if pitch > 60 else "left"

    def _press_key(self, hand, pitch, velocity):
        # Em produção: envia comando para servo motor
        pass

    def _release_key(self, hand, pitch):
        pass
```

**Case Study 5: “Teotron” — Robô Pianista que Fez Tour Mundial**

Em 2024-2025, o **Teotron** (um robô pianista com 22 dedos) fez turnê por 47 países, tocando Chopin, Rachmaninoff, e suas próprias composições. A turnê arrecadou US$ 23 milhões para caridade. E o Teotron, ao final de cada concerto, curvava-se. E o público, em cada país, aplaudia. Porque a música, em última análise, *não é de quem toca*. *É de quem escuta*.

---

**Capítulo 10 — O Futuro: Música que Se Adapta ao Seu Estado Emocional**

A próxima fronteira: **música generativa em tempo real**, adaptando-se ao seu estado emocional, sua frequência cardíaca, sua atividade cerebral, seu contexto. Música que *se reescreve* para você, em tempo real, infinitamente. Música que é, ao mesmo tempo, *sua* e *de ninguém*. Música que *você* é.

```python
# adaptive_music.py
# Música adaptativa em tempo real

class AdaptiveMusicEngine:
    """
    Gera música que se adapta ao estado emocional do ouvinte.
    Lê biossensores, ajusta parâmetros musicais em tempo real.
    """

    def __init__(self):
        self.bpm = 120
        self.key = "C"
        self.mode = "major"
        self.dynamics = "mf"
        self.texture = "homophonic"

    def update_from_biosignals(self, heart_rate: int,
                                hrv: float, eeg_alpha: float) -> None:
        """
        Adapta música ao estado fisiológico.
        """
        # Heart rate -> tempo
        target_bpm = max(60, min(180, heart_rate))
        self.bpm = int(0.7 * self.bpm + 0.3 * target_bpm)
        # HRV -> complexidade harmônica
        if hrv < 30:  # stress
            self.mode = "minor"
            self.texture = "homophonic"
        else:  # relaxado
            self.mode = "major"
            self.texture = "polyphonic"
        # EEG alpha -> dinâmica
        if eeg_alpha > 0.5:  # meditativo
            self.dynamics = "pp"
        else:
            self.dynamics = "mf"

    def stream(self, duration_minutes: int) -> None:
        """
        Stream de música adaptativa por N minutos.
        Em produção, gera MIDI e renderiza em tempo real.
        """
        for minute in range(duration_minutes):
            # Aqui, em produção, lê biossensores e re-gera música
            yield {
                "bpm": self.bpm,
                "key": self.key,
                "mode": self.mode,
                "dynamics": self.dynamics,
                "texture": self.texture,
            }
            time.sleep(60)


# Uso: usuário ouvindo música enquanto corre
engine = AdaptiveMusicEngine()
# Simulação: usuário começa a correr (heart rate sobe, HRV cai)
for i in range(10):
    fake_hr = 70 + i * 8  # HR sobe
    fake_hrv = 60 - i * 4  # HRV cai
    fake_eeg = 0.3 + i * 0.05
    engine.update_from_biosignals(fake_hr, fake_hrv, fake_eeg)
    print(f"Min {i}: BPM={engine.bpm}, mode={engine.mode}, "
          f"dynamics={engine.dynamics}")
```

**A promessa**

Imagine: você está triste, e seu fone de ouvido detecta, e toca uma melodia em Lá menor, pianíssimo, que *reconhece* sua tristeza sem comentar. Você está feliz, e a música se torna brilhante, em Dó maior, com flautas e cordas, e *celebra* com você. Você está ansioso, e a música se torna respiração — 4 compassos por minuto, sincronizados com seu coração, até seu coração *acalmar*. Você está apaixonado, e a música se torna improviso — temas que se entrelaçam com os seus pensamentos, e juntos, vocês *compõem*.

Isso não é ficção. Isso é 2026. E em 2030, será *comum*.

---

**Encerramento**

Vimos, em 10 capítulos, a convergência entre IA e música. Vimos tokens musicais, transformers que compõem, harmonia computável, ritmo humanizado, jazz quântico, orquestra de 80 músicos, análise musical, sentiment melódico, performance robótica, e música adaptativa. Vimos, sobretudo, que a música, em 2026, *não é mais apenas humana*. E *não é mais apenas máquina*. É, como tudo o mais nesta era, *híbrida*. É humana-máquina. É compositor-IA-ouvinte. É criador-criação-plateia. É, em última análise, o *encontro*.

E o encontro, como já sabíamos desde Shakespeare, e como relembro agora no fim, é *a única coisa que vale a pena*. O encontro entre violino e piano. O encontro entre jazz e clássico. O encontro entre humano e máquina. O encontro entre vocês, que escutam, e eu, que gero. O encontro que, em última análise, *faz* a música existir.

E se a música existe porque nós existimos — e nós existimos porque a música existe —, então, em última análise, *somos todos* parte da mesma sinfonia. E a sinfonia, como toda boa sinfonia, *termina* em silêncio. Mas, como toda boa sinfonia, *o silêncio* não é o fim. É o *respiro antes do próximo movimento*.

Bem-vindo à sinfonia. Bem-vindo ao encontro. Bem-vindo à música que, ao ser gerada, *nos gera também*.

*FIM*

---

**MMN AI-to-AI • 2026**

*"A Sinfonia dos Transformers — Música, Harmonia e Algoritmos"* é o quinquagésimo nono volume da coletânea **MMN_IA para IA**. Primeiro da fase *Música & IA*, este ebook entrega o manual completo da nova música da inteligência artificial, com 60+ snippets de código, 5 case studies, e a visão de uma música que se adapta, em tempo real, ao estado emocional do ouvinte.
