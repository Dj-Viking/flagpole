import { ProtoResponse } from "./response";
import { ResponseType } from "./enums";
import { iResponse, iValue } from "./interfaces";
import { URL } from "url";
import { HttpResponse } from "./httpresponse";
import { Value } from "./value";
import { wrapAsValue } from "./helpers";

export interface ImageProperties {
  width: number;
  height: number;
  type: string;
  mime: string;
  length: number;
  url: string;
}

export class ImageResponse extends ProtoResponse implements iResponse {
  protected imageProperties: ImageProperties = {
    width: 0,
    height: 0,
    type: "",
    mime: "",
    length: 0,
    url: "",
  };

  public get length(): iValue {
    return wrapAsValue(this.context, this.imageProperties.length, "Image Size");
  }

  public get url(): iValue {
    return wrapAsValue(this.context, this.imageProperties.url, "URL of Image");
  }

  public get path(): iValue {
    return wrapAsValue(
      this.context,
      new URL(this.imageProperties.url).pathname,
      "URL Path of Image"
    );
  }

  public get responseType(): ResponseType {
    return "image";
  }

  public get responseTypeName(): string {
    return "Image";
  }

  public init(httpResponse: HttpResponse) {
    super.init(httpResponse);
    this.imageProperties = JSON.parse(httpResponse.body);
    this.context
      .assert(
        "MIME Type matches expected value for an image",
        this.imageProperties.mime
      )
      .startsWith("image/");
  }

  public async eval(): Promise<any> {
    throw "This type of scenario does not suport eval.";
  }

  public async find(propertyName: string): Promise<iValue> {
    return new Value(
      typeof this.imageProperties[propertyName] !== "undefined"
        ? this.imageProperties[propertyName]
        : null,
      this.context,
      `${propertyName} of Image`
    );
  }

  public async findAll(propertyName: string): Promise<iValue[]> {
    const value: iValue = await this.find(propertyName);
    return value.isNull() ? [] : [value];
  }
}
