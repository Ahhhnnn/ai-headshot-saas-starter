# 图像编辑 nano-banana

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /v1/images/edits:
    post:
      summary: 图像编辑 nano-banana
      deprecated: false
      description: |-
        :::tip
        default分组默认返回url格式。Gemini分组默认返回base64格式（更稳定），两个分组生图价格都一样的。
        注意：该接口使用FormData参数请求，并非Json格式参数。
        使用url格式返回，url有效性仅有数小时，需尽快下载url图片地址。
        :::

        ### nano-banana (gemini-2.5-flash-image) 支持接口类型

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
          multipart/form-data:
            schema:
              type: object
              properties:
                image:
                  description: |-
                    源图像（最多传入6张图）3张以内效果最佳。
                    要编辑的图像 `File` 对象或对象数组，必须是`png`、`jpeg`、`jpg`、`webp` 等格式。
                  example: ''
                  type: string
                  format: binary
                prompt:
                  description: 所需图像的文本描述，最大支持输入32,768 Tokens。
                  example: 使用提供的客厅图片，将蓝色沙发更改为复古棕色真皮切斯特菲尔德沙发...
                  type: string
                model:
                  type: string
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
                  description: >-
                    nano-banana-pro就是
                    gemini-3-pro-image-preview模型，使用nano-banana系列命名的模型，支持url输出。
                  example: nano-banana
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
                  description: |
                    返回的数据类型：

                    `gemini-2.5-flash-image` 仅返回base64数据
                    `nano-banana` 默认返回url格式
                  example: ''
                size:
                  type: string
                  enum:
                    - '1:1'
                    - '2:3'
                    - '3:2'
                    - '3:4'
                    - '4:3'
                    - '4:5'
                    - '5:4'
                    - '9:16'
                    - '16:9'
                    - '21:9'
                    - 1k
                    - 2k
                    - 4k
                  x-apifox-enum:
                    - value: '1:1'
                      name: ''
                      description: ''
                    - value: '2:3'
                      name: ''
                      description: ''
                    - value: '3:2'
                      name: ''
                      description: ''
                    - value: '3:4'
                      name: ''
                      description: ''
                    - value: '4:3'
                      name: ''
                      description: ''
                    - value: '4:5'
                      name: ''
                      description: ''
                    - value: '5:4'
                      name: ''
                      description: ''
                    - value: '9:16'
                      name: ''
                      description: ''
                    - value: '16:9'
                      name: ''
                      description: ''
                    - value: '21:9'
                      name: ''
                      description: ''
                    - value: 1k
                      name: ''
                      description: pro专用
                    - value: 2k
                      name: ''
                      description: pro专用
                    - value: 4k
                      name: ''
                      description: pro专用
                  description: >-
                    `nano-banana`和2.5系列可输入尺寸或比例，如果传入auto或不传该参数则跟原图大小一致。

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


                    注意：`nano-banana-pro`、`gemini-3-pro-image-preview`模型请使用以下值
                    `1k`、`2k`、`4k`
                  example: ''
                aspect_ratio:
                  type: string
                  enum:
                    - '1:1'
                    - '2:3'
                    - '3:2'
                    - '3:4'
                    - '4:3'
                    - '4:5'
                    - '5:4'
                    - '9:16'
                    - '16:9'
                    - '21:9'
                  x-apifox-enum:
                    - value: '1:1'
                      name: ''
                      description: ''
                    - value: '2:3'
                      name: ''
                      description: ''
                    - value: '3:2'
                      name: ''
                      description: ''
                    - value: '3:4'
                      name: ''
                      description: ''
                    - value: '4:3'
                      name: ''
                      description: ''
                    - value: '4:5'
                      name: ''
                      description: ''
                    - value: '5:4'
                      name: ''
                      description: ''
                    - value: '9:16'
                      name: ''
                      description: ''
                    - value: '16:9'
                      name: ''
                      description: ''
                    - value: '21:9'
                      name: ''
                      description: ''
                  description: >-
                    注意：仅`nano-banana-pro`、`gemini-3-pro-image-preview`模型支持该参数。输入具体的图片比例

                    示例： `2:3`
                  example: ''
              required:
                - image
                - prompt
                - model
            example:
              image: '@otter.png'
              mask: '@mask.png'
              prompt: 一只可爱的海獺宝宝戴着贝雷帽。
              'n': 2
              size: 1024x1024
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
                        url:
                          type: string
                      x-apifox-orders:
                        - url
                required:
                  - created
                  - data
                x-apifox-orders:
                  - created
                  - data
          headers: {}
          x-apifox-name: 成功
      security:
        - bearer: []
      x-apifox-folder: 图片生成（image）/Gemini
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/5076588/apis/api-345967870-run
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