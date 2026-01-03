# 图像生成 nano-banana

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /v1/images/generations:
    post:
      summary: 图像生成 nano-banana
      deprecated: false
      description: >-
        :::tip

        default分组默认返回url格式。Gemini分组默认返回base64格式（更稳定），两个分组生图价格都一样的。

        使用url格式返回，url有效性仅有数小时，需尽快下载url图片地址。

        :::


        ### nano-banana (gemini-2.5-flash-image/gemini-3-pro-image-preview)
        支持接口类型


        | 接口类型 | 端点 | 说明 |

        | -------- | ---- | ---- |

        | OpenAI聊天接口 | /v1/chat/completions | 支持流、非流 连续对话、不支持尺寸 |

        | OpenAI图片生成接口 | /v1/image/generations | 文生图、支持尺寸 |

        | OpenAI图片编辑接口 | /v1/image/edits | 图生图（支持传入1~6张图）、支持尺寸 |
      tags:
        - 图片生成（image）/Gemini
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                prompt:
                  type: string
                  title: 提示词
                  description: 所需图像的文本描述。最大支持输入32,768 Tokens。
                model:
                  type: string
                  title: 模型名称
                  description: >-
                    nano-banana-pro就是
                    gemini-3-pro-image-preview模型，使用nano-banana系列命名的模型，支持url输出。
                  enum:
                    - nano-banana
                    - nano-banana-pro
                    - nano-banana-pro-2k
                    - nano-banana-pro-4k
                    - gemini-3-pro-image-preview
                    - gemini-2.5-flash-image
                  x-apifox-enum:
                    - value: nano-banana
                      name: ''
                      description: ''
                    - value: nano-banana-pro
                      name: ''
                      description: ''
                    - value: nano-banana-pro-2k
                      name: ''
                      description: ''
                    - value: nano-banana-pro-4k
                      name: ''
                      description: ''
                    - value: gemini-3-pro-image-preview
                      name: ''
                      description: ''
                    - value: gemini-2.5-flash-image
                      name: ''
                      description: ''
                  examples:
                    - nano-banana
                response_format:
                  type: string
                  enum:
                    - b64_json
                    - url
                  x-apifox-enum:
                    - value: b64_json
                      name: ''
                      description: ''
                    - value: url
                      name: ''
                      description: ''
                  title: 数据类型
                  description: |
                    返回的数据类型：

                    `gemini-2.5-flash-image` 仅返回base64数据
                    `nano-banana` 默认返回url格式
                size:
                  type: string
                  title: 图片大小
                  description: |
                    2.5系列可输入尺寸或比例
                    | Aspect ratio | Resolution |
                    |--------------|------------|
                    | 1:1          | 1024x1024  |
                    | 2:3          | 832x1248   |
                    | 3:2          | 1248x832   |
                    | 3:4          | 864x1184   |
                    | 4:3          | 1184x864   |
                    | 4:5          | 896x1152   |
                    | 5:4          | 1152x896   |
                    | 9:16         | 768x1344   |
                    | 16:9         | 1344x768   |
                    | 21:9         | 1536x672   |

                    注意：`gemini-3-pro-image-preview`模型请使用以下值 `1k`、`2k`、`4k`
                aspect_ratio:
                  type: string
                  title: 图片比例
                  description: |-
                    注意：仅`gemini-3-pro-image-preview`模型支持该参数。输入具体的图片比例
                    示例： `2:3`
              x-apifox-orders:
                - prompt
                - model
                - response_format
                - size
                - aspect_ratio
              required:
                - prompt
                - model
            example: |-
              // 基础示例
              {
                  "model": "nano-banana",
                  "prompt": "一张逼真的高分辨率照片，拍摄的是繁忙的城市街道",
                  "size": "2:3"
              }
              // nano-banana-pro(gemini-3-pro-image-preview)
              {
                  "model": "nano-banana-pro",
                  "prompt": "一张逼真的高分辨率照片，拍摄的是繁忙的城市街道",
                  "size": "4k",
                  "aspect_ratio": "2:3"
              }
              // 名称携带-2k、-4k，无需传aspect_ratio
              {
                  "model": "nano-banana-pro-2k",
                  "prompt": "一张逼真的高分辨率照片，拍摄的是繁忙的城市街道",
                  "size": "2:3"
              }
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  created:
                    type: integer
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        b64_json:
                          type: string
                      x-apifox-orders:
                        - b64_json
                  usage:
                    type: object
                    properties:
                      input_tokens:
                        type: integer
                      input_tokens_details:
                        type: object
                        properties:
                          image_tokens:
                            type: integer
                          text_tokens:
                            type: integer
                        required:
                          - image_tokens
                          - text_tokens
                        x-apifox-orders:
                          - image_tokens
                          - text_tokens
                      output_tokens:
                        type: integer
                      total_tokens:
                        type: integer
                    required:
                      - input_tokens
                      - input_tokens_details
                      - output_tokens
                      - total_tokens
                    x-apifox-orders:
                      - input_tokens
                      - input_tokens_details
                      - output_tokens
                      - total_tokens
                required:
                  - created
                  - data
                  - usage
                x-apifox-orders:
                  - created
                  - data
                  - usage
          headers: {}
          x-apifox-name: 成功
      security:
        - bearer: []
      x-apifox-folder: 图片生成（image）/Gemini
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/5076588/apis/api-345881374-run
components:
  schemas: {}
  securitySchemes:
    bearer:
      type: http
      scheme: bearer
servers:
  - url: https://api.gpt.ge
    description: 线上
security:
  - bearer: []

```