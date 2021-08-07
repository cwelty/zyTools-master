function InheritanceTree() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.lang = (options && options['lang']) ? options['lang'] : 'cpp';
        this.code = {};
        this.languagesWithTwoWordClasses = [ 'cpp', 'java' ];

        var self = this;
        $('#' + this.id).click(function() {
            if (!self.beenClicked) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: '',
                    metadata: {
                        event: 'inheritance tree tool clicked'
                    }
                };
                parentResource.postEvent(event);
            }
            self.beenClicked = true;
        });

        const hbsVariables = {
            id: this.id,
            functionsOrMethods: this.lang === 'cpp' ? 'functions' : 'methods',
            item: this.languagesWithTwoWordClasses.includes(this.lang) ? 'GenericItem' : 'Item',
            produce: this.languagesWithTwoWordClasses.includes(this.lang) ? 'ProduceItem' : 'Produce',
            book: this.languagesWithTwoWordClasses.includes(this.lang) ? 'BookItem' : 'Book',
            fruit: this.languagesWithTwoWordClasses.includes(this.lang) ? 'FruitItem' : 'Fruit',
            dairy: this.languagesWithTwoWordClasses.includes(this.lang) ? 'DairyItem' : 'Dairy',
            textbook: this.languagesWithTwoWordClasses.includes(this.lang) ? 'TextbookItem' : 'Textbook',
            audiobook: this.languagesWithTwoWordClasses.includes(this.lang) ? 'AudiobookItem' : 'Audiobook',
        };

        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this[this.name].inheritanceTree(hbsVariables);

        $('#' + this.id).html(css + html);

        $('#' + this.id + ' .45deg_up_right').attr('type', 'text/javascript')
            .attr('src', this.parentResource.getResourceURL('pic_45deg_up_right.png', this.name));
        $('#' + this.id + ' .45deg_up_left')
            .attr('src', this.parentResource.getResourceURL('pic_45deg_up_left.png', this.name));

        this.code.Item = $(`#${this.lang}_baseClass_code_${this.id}`).html();
        this.code.Produce = $(`#${this.lang}_derivedClass1a_code_${this.id}`).html();
        this.code.Book = $(`#${this.lang}_derivedClass1b_code_${this.id}`).html();
        this.code.Fruit = $(`#${this.lang}_derivedClass2a_code_${this.id}`).html();
        this.code.Dairy = $(`#${this.lang}_derivedClass2b_code_${this.id}`).html();
        this.code.Textbook = $(`#${this.lang}_derivedClass2c_code_${this.id}`).html();
        this.code.Audiobook = $(`#${this.lang}_derivedClass2d_code_${this.id}`).html();

        const initiallySelected = this.code[this.getPropertyFromText('Item')];

        this.update($('#inheritanceTree_class1_' + this.id));
        $('#inheritanceTree_selectedClassCode_' + this.id).html(`<div>${initiallySelected}</div>`);

        $(`#${this.id} .classLabel`).click(function() {
            const propertyToShow = self.getPropertyFromText($(this).text());

            $(`#inheritanceTree_selectedClassCode_${self.id}`).html(`<div>${self.code[propertyToShow]}</div>`);
            self.update($(this));
        });
    };

    this.getPropertyFromText = function(text) {
        if (!this.languagesWithTwoWordClasses.includes(this.lang)) {
            return text;
        }

        switch (text) {
            case 'ProduceItem':
                return 'Produce';
            case 'BookItem':
                return 'Book';
            case 'FruitItem':
                return 'Fruit';
            case 'DairyItem':
                return 'Dairy';
            case 'TextbookItem':
                return 'Textbook';
            case 'AudiobookItem':
                return 'Audiobook';
            default:
                return 'Item';
        }
    };

    this.update = function($obj) {
        $(`#${this.id} .classLabel`).removeClass('highlighted');
        $obj.addClass('highlighted');

        if ($obj.attr('id') === (`inheritanceTree_class1_${this.id}`)) {
            $(`#inheritanceTree_pseudocode_${this.id}`).html($(`#${this.lang}_baseClass_pseudocode_${this.id}`).html());
        }
        else if ($obj.attr('id') === (`inheritanceTree_class2_${this.id}`)) {
            $(`#inheritanceTree_class1_${this.id}`).addClass('highlighted');
            $(`#inheritanceTree_pseudocode_${this.id}`).html($(`#${this.lang}_derivedClass1a_pseudocode_${this.id}`).html());
        }
        else if ($obj.attr('id') === (`inheritanceTree_class3_${this.id}`)) {
            $(`#inheritanceTree_class1_${this.id}`).addClass('highlighted');
            $(`#inheritanceTree_pseudocode_${this.id}`).html($(`#${this.lang}_derivedClass1b_pseudocode_${this.id}`).html());
        }
        else if ($obj.attr('id') === (`inheritanceTree_class4_${this.id}`)) {
            $(`#inheritanceTree_class1_${this.id}`).addClass('highlighted');
            $(`#inheritanceTree_class2_${this.id}`).addClass('highlighted');
            $(`#inheritanceTree_pseudocode_${this.id}`).html($(`#${this.lang}_derivedClass2a_pseudocode_${this.id}`).html());
        }
        else if ($obj.attr('id') === (`inheritanceTree_class5_${this.id}`)) {
            $(`#inheritanceTree_class1_${this.id}`).addClass('highlighted');
            $(`#inheritanceTree_class2_${this.id}`).addClass('highlighted');
            $(`#inheritanceTree_pseudocode_${this.id}`).html($(`#${this.lang}_derivedClass2b_pseudocode_${this.id}`).html());
        }
        else if ($obj.attr('id') === (`inheritanceTree_class6_${this.id}`)) {
            $(`#inheritanceTree_class1_${this.id}`).addClass('highlighted');
            $(`#inheritanceTree_class3_${this.id}`).addClass('highlighted');
            $(`#inheritanceTree_pseudocode_${this.id}`).html($(`#${this.lang}_derivedClass2c_pseudocode_${this.id}`).html());
        }
        else if ($obj.attr('id') === (`inheritanceTree_class7_${this.id}`)) {
            $(`#inheritanceTree_class1_${this.id}`).addClass('highlighted');
            $(`#inheritanceTree_class3_${this.id}`).addClass('highlighted');
            $(`#inheritanceTree_pseudocode_${this.id}`).html($(`#${this.lang}_derivedClass2d_pseudocode_${this.id}`).html());
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var inheritanceTreeExport = {
    create: function() {
        return new InheritanceTree();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = inheritanceTreeExport;
