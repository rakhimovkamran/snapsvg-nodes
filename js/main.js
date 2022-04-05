class Nodes {
  _actions = null;
  _paper = null;
  _path = null;

  constructor(config) {
    this.backgroundColor = config.backgroundColor;
    this.accentColor = config.accentColor;

    this.isPolygonal = config.isPolygonal;
    this.hasAreaFill = config.hasAreaFill;

    this.height = config.height;
    this.width = config.width;

    this._initPaper();
    this._declareStyles();
    this._declarePath();
    this._declareActions();

    this.nodes = [];
  }

  _declareStyles() {
    this._styles = {
      path: {
        fill: this.hasAreaFill
          ? this._hexToRGB(this.accentColor, "0.3")
          : "transparent",
        stroke: this.accentColor,
        strokeWidth: 1.5,
      },

      circle: {
        fill: this.accentColor,
        stroke: this.backgroundColor,
        strokeWidth: 5,
      },
    };
  }

  _declareActions() {
    this._actions = {
      circle: {
        onMouseOver() {
          this.stop().animate(
            {
              r: 20,
            },
            1000,
            mina.elastic
          );
        },

        onMouseOut() {
          this.stop().animate(
            {
              r: 15,
            },
            1000,
            mina.elastic
          );
        },

        onDrag: (context) => {
          return (_cx, _cy, x, y) => {
            let currentNode = this.nodes[context.data("idx")];

            context.attr({
              cx: x,
              cy: y,
            });

            currentNode.x = x;
            currentNode.y = y;

            this._renderPath();
          };
        },

        onDragStart: () => {
          this._path.stop().animate(
            {
              opacity: 0.2,
            },
            200,
            mina.easeinout
          );
        },
        onDragEnd: () => {
          this._path.stop().animate(
            {
              opacity: 1,
            },
            1000,
            mina.easeinout
          );
        },
      },
    };
  }

  _declarePath() {
    this._path = this._paper.path("").attr(this._styles.path);
  }

  _renderPath() {
    const first = this.nodes[0];
    let path = `M ${first.x},${first.y}`;

    for (const node of this.nodes.slice(1)) {
      path += `${this.isPolygonal ? "L" : "T"} ${node.x},${node.y}`;
    }

    this._path.attr({
      d: path,
    });
  }

  _initPaper() {
    this._paper = Snap(this.width, this.height);
    this._paper.node.style["backgroundColor"] = this.backgroundColor;

    this._bindEvents();
  }

  _bindEvents() {
    this._paper.node.onclick = ({ pageX, pageY, target }) => {
      if (!target.classList.contains("_node_")) {
        const circle = this._paper
          .circle(pageX, pageY, 15)
          .attr(this._styles.circle);

        /* Add Unique ID to Node */
        circle.data("idx", this.nodes.length);

        /* Add a class Node */
        circle.node.classList.add("_node_");

        /* Mouse Actions */
        circle.mouseover(this._actions.circle.onMouseOver);
        circle.mouseout(this._actions.circle.onMouseOut);

        /* Drag Actions */
        circle.drag(
          this._actions.circle.onDrag(circle),
          this._actions.circle.onDragStart,
          this._actions.circle.onDragEnd
        );

        /* Push Node Coors to Nodes Array */
        this.nodes.push({ x: pageX, y: pageY });

        this._renderPath();
      }
    };
  }

  _hexToRGB(hex, alpha) {
    let r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    return `rgba(${r}, ${g}, ${b})`;
  }
}

const nodes = new Nodes({
  height: window.innerHeight,
  width: window.innerWidth,

  backgroundColor: "#222831",
  accentColor: "#00ADB5",

  isPolygonal: false,
  hasAreaFill: true,
});
