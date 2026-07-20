import words from '../data/words.js';

export function createLoremGenerator(prng) {
  return {
    word() {
      return prng.pick(words);
    },
    words(count = 5) {
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(this.word());
      }
      return result.join(' ');
    },
    sentence(wordCount) {
      const count = wordCount || prng.int(8, 15);
      const str = this.words(count);
      return str.charAt(0).toUpperCase() + str.slice(1) + '.';
    },
    sentences(count = 3) {
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(this.sentence());
      }
      return result.join(' ');
    },
    paragraph(sentenceCount) {
      const count = sentenceCount || prng.int(3, 6);
      return this.sentences(count);
    },
    paragraphs(count = 3) {
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(this.paragraph());
      }
      return result.join('\n\n');
    },
    slug(wordCount = 3) {
      return this.words(wordCount).toLowerCase().replace(/\s+/g, '-');
    },
    lines(count = 5) {
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(this.sentence());
      }
      return result.join('\n');
    },
    text(length) {
      let result = '';
      while (result.length < length) {
        result += this.sentence() + ' ';
      }
      return result.substring(0, length).trim() + (result.length > length ? '.' : '');
    }
  };
}
