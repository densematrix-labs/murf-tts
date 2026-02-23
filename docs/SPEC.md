# Murf TTS — Murf.ai Alternative

Free, professional-grade AI voice generator for content creators, educators, and businesses.

## 竞品信息

| 项目 | 值 |
|------|-----|
| 对标竞品 | Murf.ai |
| 竞品 URL | https://murf.ai |
| 预估月流量 | 1.49M |
| 定价模式 | Freemium + Subscription ($19-$99/mo) |

## 核心功能（必做）

1. **Text to Speech Generation** — 输入文本，选择声音，生成高质量音频
2. **多声音选择** — 提供男声/女声、多种口音（American, British, Australian等）
3. **语速/音调调节** — 支持调整语速 (0.5x - 2x) 和音调
4. **多语言支持** — 英语、中文、日语、德语、法语、韩语、西班牙语
5. **音频下载** — 支持 MP3/WAV 格式导出
6. **批量处理** — 支持长文本分段处理

## 差异化定位

- ✅ **免费使用** — 每天 5 次免费生成
- ✅ **无需注册** — 设备指纹追踪，无门槛试用
- ✅ **更便宜** — 比 Murf.ai 便宜 70%+
- ✅ **更简单** — 无需复杂的 studio 界面，一键生成
- ✅ **隐私优先** — 不存储用户文本

## 截流关键词（🔴 SEO 必用）

### Primary（首页 Title/H1）
- `Murf.ai alternative`
- `Murf alternative free`
- `free AI voice generator`

### Secondary（独立页面）
- `Murf.ai vs ElevenLabs`
- `best Murf.ai alternatives 2026`
- `Murf.ai free alternative`

### Long-tail（Programmatic SEO）
- `Murf.ai alternative no watermark`
- `Murf.ai alternative for YouTube`
- `Murf.ai alternative for podcasts`
- `free text to speech like Murf`
- `AI voiceover generator free`

## 声音配置

| Voice ID | Name | Gender | Accent | Language |
|----------|------|--------|--------|----------|
| en-US-male-1 | James | Male | American | English |
| en-US-female-1 | Emily | Female | American | English |
| en-GB-male-1 | Oliver | Male | British | English |
| en-GB-female-1 | Sophia | Female | British | English |
| en-AU-female-1 | Chloe | Female | Australian | English |
| zh-CN-female-1 | 小雪 | Female | Mandarin | Chinese |
| zh-CN-male-1 | 云扬 | Male | Mandarin | Chinese |
| ja-JP-female-1 | 美咲 | Female | Japanese | Japanese |
| de-DE-female-1 | Anna | Female | German | German |
| fr-FR-female-1 | Marie | Female | French | French |
| ko-KR-female-1 | 지현 | Female | Korean | Korean |
| es-ES-female-1 | Carmen | Female | Spanish | Spanish |

## 技术方案

- **前端**：React + Vite (TypeScript) + Tailwind CSS
- **后端**：Python FastAPI
- **TTS API**：通过 llm-proxy.densematrix.ai 调用 OpenAI TTS / Azure TTS
- **音频处理**：服务端生成，返回音频 URL
- **部署**：Docker → langsheng (39.109.116.180)
- **域名**：murf-tts.demo.densematrix.ai

## API 设计

### POST /api/v1/generate
```json
{
  "text": "Hello, this is a test.",
  "voice_id": "en-US-female-1",
  "speed": 1.0,
  "pitch": 0,
  "format": "mp3"
}
```

Response:
```json
{
  "audio_url": "/audio/abc123.mp3",
  "duration": 2.5,
  "characters": 27
}
```

### GET /api/v1/voices
返回可用声音列表

### GET /api/v1/tokens
返回用户剩余 token 数

## 定价方案

| Tier | 价格 | 字符数 | 说明 |
|------|------|--------|------|
| Free | $0 | 每天 5000 字符 | 设备限制 |
| Starter | $4.99 | 50,000 字符 | 一次性购买 |
| Pro | $9.99 | 150,000 字符 | 一次性购买 |
| Unlimited | $9.99/月 | 无限 | 订阅制 |

## 完成标准

- [x] 核心 TTS 功能可用
- [ ] 12+ 种声音可选
- [ ] 语速/音调调节
- [ ] MP3/WAV 下载
- [ ] i18n 7 种语言
- [ ] 支付集成 (Creem)
- [ ] 部署到 murf-tts.demo.densematrix.ai
- [ ] SEO 截流关键词覆盖
- [ ] Health check 通过
