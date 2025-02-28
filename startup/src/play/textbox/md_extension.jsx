// Code adapted from https://marked.js.org/using_pro

// Create reference instance
import { marked, Lexer } from "marked";

// Override function
export const renderer = {
  extensions: [
    {
      name: "descriptionList",
      level: "block", // Is this a block-level or inline-level tokenizer?
      start(src) {
        return src.match(/:[^:\n]/)?.index;
      }, // Hint to Marked.js to stop and check for a match
      tokenizer(src, tokens) {
        const rule = /^(?::[^:\n]+:[^:\n]*(?:\n|$))+/; // Regex for the complete token, anchor to string start
        const match = rule.exec(src);
        if (match) {
          const token = {
            // Token to generate
            type: "descriptionList", // Should match "name" above
            raw: match[0], // Text to consume from the source
            text: match[0].trim(), // Additional custom properties
            tokens: [], // Array where child inline tokens will be generated
          };
          this.lexer.inline(token.text, token.tokens); // Queue this data to be processed for inline tokens
          return token;
        }
      },
      renderer(token) {
        return `<dl>${this.parser.parseInline(token.tokens)}\n</dl>`; // parseInline to turn child tokens into HTML
      },
    },

    {
      name: "description",
      level: "inline", // Is this a block-level or inline-level tokenizer?
      start(src) {
        return src.match(/:/)?.index;
      }, // Hint to Marked.js to stop and check for a match
      tokenizer(src, tokens) {
        const rule = /^:([^:\n]+):([^:\n]*)(?:\n|$)/; // Regex for the complete token, anchor to string start
        const match = rule.exec(src);
        if (match) {
          return {
            // Token to generate
            type: "description", // Should match "name" above
            raw: match[0], // Text to consume from the source
            dt: this.lexer.inlineTokens(match[1].trim()), // Additional custom properties, including
            dd: this.lexer.inlineTokens(match[2].trim()), //   any further-nested inline tokens
          };
        }
      },
      renderer(token) {
        return `\n<dt>${this.parser.parseInline(
          token.dt
        )}</dt><dd>${this.parser.parseInline(token.dd)}</dd>`;
      },
      childTokens: ["dt", "dd"], // Any child tokens to be visited by walkTokens
    },
  ],

  walkTokens: (token) => {
    // Post-processing on the completed token tree
    if (token.type === "strong") {
      token.text += " walked";
      token.tokens = this.Lexer.lexInline(token.text);
    }
  },
};
