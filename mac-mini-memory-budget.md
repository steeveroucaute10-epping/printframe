# Mac Mini Memory Budget — LLM Model Benchmarks

Based on quantized models running via Ollama on Mac Mini with unified memory.

## Memory Requirements (Unified Memory)

| Model | Q4 (Quart) | Q8 (Octave) | FP16 |
|-------|-----------|------------|------|
| Phi-3 mini (3.8B) | 2–3 GB | 4–5 GB | 7–8 GB |
| Mistral 7B | 4–6 GB | 7–9 GB | 14–16 GB |
| Llama 3 8B | 5–9 GB | 10–14 GB | 16–20 GB |
| Mixtral 8x7B | 20–30 GB | 40–50 GB | 70+ GB |
| Llama 3 70B | 40–48 GB | N/A (too large) | N/A |

## Mac Mini Memory Tiers

### 16 GB Mac Mini
- Stack: ~900 MB
- Available for LLM: ~15 GB
- Best model: Mistral 7B Q8 or Llama 3 8B Q4

### 24 GB Mac Mini
- Stack: ~900 MB
- Available for LLM: ~23 GB
- Best model: Llama 3 8B Q8 or Mixtral 8x7B Q4 (with limited context)

### 32 GB Mac Mini
- Stack: ~900 MB
- Available for LLM: ~31 GB
- Best model: Mixtral 8x7B Q4 comfortably

### 48 GB Mac Mini (pro)
- Stack: ~900 MB
- Available for LLM: ~47 GB
- Best model: Mixtral 8x7B Q4 or Llama 3 70B Q4

## Docker Compose Memory Configuration

```yaml
# For 16GB Mac Mini
services:
  app:
    mem_limit: 256m
    memory_swap: 256m
  postgres:
    mem_limit: 256m
    memory_swap: 256m

# For 24GB+ Mac Mini
services:
  app:
    mem_limit: 512m
    memory_swap: 512m
  postgres:
    mem_limit: 256m
    memory_swap: 256m
  redis:
    mem_limit: 128m
    memory_swap: 128m
```

## LLM Container Configuration

If running Ollama in Docker:

```yaml
ollama:
  image: ollama/ollama:latest
  mem_limit: 8g          # Depends on model
  memory_swap: 8g
  ports:
    - "11434:11434"
  volumes:
    - ollama_data:/root/.ollama
```

## Performance Notes

- **Q4 quantization** reduces model size by ~75% with minimal quality loss for most tasks
- **Q8 quantization** reduces size by ~50% with near-lossless quality
- **Unified memory** means Docker containers and LLMs share the same pool — total memory across all processes must stay under physical RAM
- **Swap usage** (disk-backed memory) dramatically slows LLM inference — keep all containers under their memory limits
- **Ollama** has its own memory management — it will use as much as available, so container memory limits help reserve RAM for the stack

## Verification Commands

```bash
# Check available memory
sysctl hw.memsize          # Total RAM
vm_stat                    # Page stats

# Check Docker memory usage
docker stats --no-stream

# Check LLM model in Ollama
ollama list

# Check what's using memory
sudo top -l 1 -n 0 | head -30
```

## References

- [Ollama Model Library](https://ollama.com/library)
- [Hugging Face Model Size Estimator](https://huggingface.co/docs/accelerate/en/usage_guides/model_size_estimator)
- [Hugging Face Model Memory Space](https://huggingface.co/spaces/hf-accelerate/model-memory-usage)
- [Apple Unified Memory — Wikipedia](https://en.wikipedia.org/wiki/Apple silicon#Unified_memory_architecture)
