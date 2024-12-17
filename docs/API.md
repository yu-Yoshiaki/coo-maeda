# API 仕様書

## テンプレート API

### テンプレート一覧取得

```typescript
GET /api/templates

Response:
{
  templates: {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    category: string;
    tags: string[];
  }[];
  total: number;
}
```

### テンプレート詳細取得

```typescript
GET /api/templates/:id

Response:
{
  id: string;
  name: string;
  description: string;
  content: {
    html: string;
    css: string;
    config: Record<string, any>;
  };
  metadata: {
    author: string;
    created: string;
    updated: string;
  };
}
```

## AI API

### テキスト生成

```typescript
POST /api/ai/text
{
  prompt: string;
  context?: {
    industry?: string;
    tone?: string;
    length?: number;
  };
}

Response:
{
  text: string;
  metadata: {
    tokens: number;
    model: string;
  };
}
```

### 画像生成

```typescript
POST /api/ai/image
{
  prompt: string;
  size?: "256x256" | "512x512" | "1024x1024";
  style?: string;
}

Response:
{
  url: string;
  metadata: {
    size: string;
    format: string;
  };
}
```

## カスタマイズ API

### 設定保存

```typescript
POST / api / customize / save;
{
  templateId: string;
  changes: {
    type: "text" | "style" | "layout";
    path: string;
    value: any;
  }
  [];
}

Response: {
  id: string;
  version: number;
  timestamp: string;
}
```

### 設定取得

```typescript
GET /api/customize/:id

Response:
{
  id: string;
  templateId: string;
  changes: {
    type: string;
    path: string;
    value: any;
  }[];
  metadata: {
    version: number;
    created: string;
    updated: string;
  };
}
```

## エクスポート API

### HTML 生成

```typescript
POST /api/export/html
{
  customizeId: string;
  options?: {
    minify?: boolean;
    inline?: boolean;
  };
}

Response:
{
  html: string;
  assets: {
    path: string;
    content: string;
  }[];
}
```

### デプロイ

```typescript
POST /api/export/deploy
{
  customizeId: string;
  platform: "vercel" | "netlify";
  options?: Record<string, any>;
}

Response:
{
  url: string;
  deploymentId: string;
  status: "success" | "pending" | "failed";
}
```
