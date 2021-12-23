import { MessageAttachment, MessageEmbed, MessageOptions } from 'discord.js';

export abstract class ComboLibraryElement<T> {
    public data?: T;
    protected _embed?: MessageEmbed;

    constructor(data: T | MessageEmbed) {
        if (data instanceof MessageEmbed) {
            this._embed = data;
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
    protected abstract createEmbed(data: T): MessageEmbed;

    /**
     * Override this if the ComboLibraryElement needs to include attachments
     *
     * @returns The attachments to include in the message
     */
    public async getAttachments(): Promise<MessageAttachment[]> {
        return [];
    }

    public async toMessageOptions() {
        const m: MessageOptions = {
            embeds: [this.embed],
            files: await this.getAttachments(),
        };

        return m;
    }

    private compare(embed1: MessageEmbed, embed2: MessageEmbed) {
        if (
            embed1.title !== embed2.title ||
            embed1.description !== embed2.description ||
            embed1.footer?.text !== embed2.footer?.text ||
            embed1.fields.length !== embed2.fields.length ||
            embed1.fields.some((f, i) => f.name !== embed2.fields[i].name || f.value !== embed2.fields[i].value) ||
            embed1.image?.url.split('/').pop() !== embed2.image?.url.split('/').pop()
        ) {
            return false;
        }

        return true;
    }

    public compareTo(combo: this) {
        return this.compare(this.embed, combo.embed);
    }
}
