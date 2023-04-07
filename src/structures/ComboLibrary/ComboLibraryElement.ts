import { AttachmentBuilder, Embed, EmbedBuilder, MessageCreateOptions } from 'discord.js';

export abstract class ComboLibraryElement<T> {
  public data?: T;
  protected _embed?: EmbedBuilder;

  constructor(data: T | EmbedBuilder | Embed) {
    if (data instanceof EmbedBuilder) {
      this._embed = data;
    } else if (data instanceof Embed) {
      this._embed = EmbedBuilder.from(data);
    } else {
      this.data = data;
    }
  }

  public get embed() {
    if (this._embed) return this._embed;

    if (this.data) return this.createEmbed(this.data);
    throw new Error('Unable to get embed');
  }

  /**
   * Create an embed for this ComboLibraryElement
   *
   * @param data Data for the embed
   */
  protected abstract createEmbed(data: T): EmbedBuilder;

  /**
   * Override this if the ComboLibraryElement needs to include attachments
   *
   * @returns The attachments to include in the message
   */
  public async getAttachments(): Promise<AttachmentBuilder[]> {
    return [];
  }

  public async toMessageOptions(): Promise<MessageCreateOptions> {
    const m = {
      embeds: [this.embed],
      files: await this.getAttachments(),
    };

    return m;
  }

  private compare(embed1: EmbedBuilder, embed2: EmbedBuilder) {
    const data1 = embed1.data;
    const data2 = embed2.data;

    if (
      data1.title?.trim() !== data2.title?.trim() ||
      data1.description !== data2.description ||
      data1.footer?.text !== data2.footer?.text ||
      data1.fields?.length !== data2.fields?.length ||
      data1.fields?.some((f, i) => f.name !== data2.fields?.[i].name || f.value !== data2.fields[i].value) ||
      data1.image?.url.split('/').pop() !== data2.image?.url.split('/').pop()
    ) {
      console.log(data1, data2);
      return false;
    }

    return true;
  }

  public compareTo(combo: this) {
    return this.compare(this.embed, combo.embed);
  }
}
