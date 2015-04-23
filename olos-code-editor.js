(function(params){

  var widgets = []

function updateHints(editor) {
  editor.operation(function(){
    for (var i = 0; i < widgets.length; ++i)
      editor.removeLineWidget(widgets[i]);
    widgets.length = 0;

    JSHINT(editor.getValue());
    // console.log("errors: " + JSHINT.errors.length);
    for (var i = 0; i < JSHINT.errors.length; ++i) {
      var err = JSHINT.errors[i];
      if (!err) continue;
      var msg = document.createElement("div");
      var icon = msg.appendChild(document.createElement("span"));
      icon.innerHTML = "!!";
      icon.className = "lint-error-icon";
      msg.appendChild(document.createTextNode(err.reason));
      msg.className = "lint-error";
      // display errors?
      // widgets.push(editor.addLineWidget(err.line - 1, msg, {coverGutter: false, noHScroll: true}));
    }
  });
  var info = editor.getScrollInfo();
  var after = editor.charCoords({line: editor.getCursor().line + 1, ch: 0}, "local").top;
  if (info.top + info.clientHeight < after)
    editor.scrollTo(null, after - info.clientHeight + 3);
}



  Polymer({

    width: 900,
    height: 500,
    rootfolder: '../olos-code-editor/',

    // callback function to run when the code is changed
    codeCallback: function() {},

    // using attached instead of ready so as not to overwrite code-mirror's ready method
    attached: function() {
      this.watchCode();
      this._adjustDimensions();
      // this.setAttribute("style","width:"+this.width+"px; height: " + this.height +"px;");
      // this.style.content = this.style.content + "width: " + this.width+"px; height: " + this.height + "px";
      // console.log(this.style);
      // this.mirror.options.mode = "javascript";
      // this.mirror.options.linenumbers = false;
      this.theme = "cobalt";

      // console.log(this.mirror.gutters);
      // this.mirror.options.gutters = ["CodeMirror-lint-markers"];
      // this.mirror.options.lint = true;

      // this._addContainer();
    },

    beginEditing: function(html) {
      if (html){
        this.setValue(html);
      }
      this.refresh();
      this.async('prepareCode');
    },

    finishEditing: function() {
      this._styleUnfolded = !this._isStyleFolded();
      return this.getValue();
    },

    getValue: function() {
      return this.mirror.getValue();
    },

    setValue: function(value) {
      this.mirror.setValue(value);
    },

    prepareCode: function() {
      this.focus();

      // fold style tag
      var cm = this.mirror;
      var c = cm.getSearchCursor('<style>');
      if (c.find()) {
        var l = c.pos.from.line;
        cm.setSelection({line: l});
        if (!this._styleUnfolded) {
          cm.foldCode(l);
        }
        cm.execCommand('goLineDown');
        cm.execCommand('goLineStartSmart');
      }
    },

    watchCode: function() {
      var self = this;
      self.mirror.on('change',function(cMirror){
        // get value right from instance
        // console.log(cMirror.getValue());

        // lint
        updateHints(cMirror);
        if (JSHINT.errors.length === 0) {
          self.codeCallback( cMirror.getValue() );
        }

      });
    },

    widthChanged: function() {
      this._adjustDimensions();
    },

    heightChanged: function() {
      this._adjustDimensions();
    },

    resize: function() {
      this._adjustDimensions();
    },

    _adjustDimensions: function() {
      console.log(this);
      // console.log(this.$.container);
      if (typeof(this.$.container) !== 'undefined') {
        this.$.container.setAttribute("style","width:"+this.width+"px; height: " + this.height +"px;");
      }
      this.setAttribute("style","width:"+this.width*.8+"px; height: " + this.height*.8 +"px;");

      // this.setAttribute("style","width:100%; height: 100%;");

    },

    // _addContainer: function() {
    //   // codeEditor = document.querySelector('olos-code-editor');
    //   var codeEditor = this;

    //   var theEditor = codeEditor.shadowRoot.querySelectorAll('CodeMirror')[0];

    //   var container = document.createElement("div");
    //   container.id = "container";
    //   container.appendChild(theEditor);
    //   codeEditor.shadowRoot.appendChild(container);
    // },

    // set a callback function for when the code is changed
    codeChanged: function(doSomething) {
      this.codeCallback = doSomething;
    }

  });

})();