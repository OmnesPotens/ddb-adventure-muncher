const logger = require("../../logger.js");
const { Journal } = require("./Journal");


class ImageJournal extends Journal {

  TYPE = "image";
  PAGE_TYPE = "image";

  get section() {
    return false;
  }

  get image() {
    return true;
  }
 
  appendJournalToChapter() {
    // we don't append images to chapters
  }

  generateTable() {
    // we don't generate tables for images
  }

  replaceImgLinksForJournal() {
    const reImage = new RegExp(`^\.\/${this.adventure.bookCode}\/`, "g");
    const text1 = this.imagePath.replace(reImage, "assets/");
    const reImage2 = new RegExp(`^${this.adventure.bookCode}\/`, "g");
    const text2 = text1.replace(reImage2, "assets/");
  
    return text2;
  }


  // we check the generated assets to see if this asset is unique (so far)
  isDuplicate() {
    return this.adventure.assets.includes(this.imageContent);
  }

  _generateJournalEntryShared() {
    if (!this.duplicate) {
      if (this.adventure.config.imageFind) {
        this.adventure.imageFinder.journalResults.push({
          bookCode: this.adventure.bookCode,
          img: this.imageContent,
          name: this.row.name,
          slug: this.row.slug,
        });
      }
    }
    this.adventure.assets.push(this.imageContent);
    const journalHandoutCount = this.adventure.assets.filter(img => img === this.imageContent).length;
    logger.debug(`Generated Handout ${this.row.name}, "${this.imageContent}", (count ${journalHandoutCount}), Duplicate? ${this.duplicate}`);

  }

  _generateJournalEntryV10() {
    if (this.duplicate) {
      const journalMatch =  this.adventure.journals.map((j) => j.data.pages).flat().find((j) => j.src === this.imageContent);
      this.data.flags.ddb.linkId = journalMatch ? journalMatch._id : null;
      this.data.flags.ddb.linkName = journalMatch ? journalMatch.name : null;
    }
    this._generateJournalEntryShared();

    const page = this.generatePage(this.imageContent);

    if (!this.row.parentId) this.data.flags.ddb.linkId = this.data._id;
    this.data.pages.push(page);

  }

  _generateJournalEntryOld() {
    this.data.img = this.imageContent;

    if (this.duplicate) {
      const journalMatch = generatedJournals.find((j) => j.img === this.data.img);
      this.data.flags.ddb.linkId = journalMatch ? journalMatch._id : null;
      this.data.flags.ddb.linkName = journalMatch ? journalMatch.name : null;
    }
    this._generateJournalEntryShared();
    this.data.flags.ddb.linkId = this.data._id;
  }

  constructor(adventure, row, imagePath) {
    this.imagePath = imagePath;
    this.imageContent = this.replaceImgLinksForJournal();
    this.data.flags.ddb.imageSrc = this.imageContent;
    super(adventure, row);
  }
}

exports.Image = ImageJournal;
