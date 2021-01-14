class SnailShellMatrix {
    constructor(gap = 1, x = 0, y = 0) {
        this.gap = gap;

        // overall position; 1 for first X, Y point
        this.position = 1;

        // level = amount of points at this line (starting with 2)
        // increments every two lines
        this.level = 2;

        // levelStep = 0 for horizontal lines and 1 for vertical
        // increments every line
        this.levelStep = 1;

        // levelPosition = current point at step
        this.stepPosition = 1;

        this.x = x;
        this.y = y;
    }

    setGap(gap) {
        if (gap > 0) {
            this.gap = gap;
        }
    }

    getNext() {
        this.position++;
        this.stepPosition++;

        if (this.level % 2 === 0) {
            if (this.levelStep === 1) {
                this.x += this.gap;
            } else {
                this.y += this.gap;
            }
        } else {
            if (this.levelStep === 1) {
                this.x -= this.gap;
            } else {
                this.y -= this.gap;
            }
        }

        let ret = [this.position, [this.x, this.y]];

        if (this.stepPosition === this.level) {
            if (this.levelStep === 1) {
                this.levelStep++;
            } else {
                this.levelStep = 1;
                this.level++;
            }
            this.stepPosition = 1;
        }

        return ret;
    }
}

module.exports = SnailShellMatrix;
