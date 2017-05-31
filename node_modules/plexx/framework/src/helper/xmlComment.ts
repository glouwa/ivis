class XMLComment {

    public commentText: string;

    public constructor(commentText: string) {
        this.commentText = commentText;
    }

    public getLineCommentTag(): string {
        return "<!-- " + this.commentText + " -->";
    }

    public getBlockCommentTag(): string {
        return "<!--\n" + this.commentText + "\n-->";
    }
}
