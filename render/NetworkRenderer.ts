import type IDrawable from '@/render/IDrawable';
import type { Transform } from '@/render/Transform';
import { GateNode, PathNode, PinNode, type NetworkNode } from '@/simulation';
import type { Network } from '@/simulation/Network';

function randomVector(radius = 1) {
  const angle = Math.random() * Math.PI * 2;
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}

class NetworkRendererNode<
  TNode extends NetworkNode = NetworkNode,
> implements IDrawable {
  public node: TNode;
  public position: { x: number; y: number } = { x: 0, y: 0 };
  public connections = new Set<NetworkRendererNode>();

  constructor(node: TNode) {
    this.node = node;
  }

  public drawConnections(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.position;
    ctx.save();
    ctx.translate(x, y);
    ctx.lineWidth = 1;
    for (const connection of this.connections) {
      // if (connection.position.x < x || connection.position.y < y) continue;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(connection.position.x - x, connection.position.y - y);
      ctx.strokeStyle = 'black';
      ctx.stroke();
    }
    ctx.restore();
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.position;
    ctx.save();
    ctx.translate(x, y);
    ctx.lineWidth = 1.5;
    if (this.node instanceof PinNode) {
      ctx.strokeStyle =
        this.node.active || this.node.isVCC ? 'green' : '#DADADA';
      ctx.fillStyle = '#DADADA';
      ctx.fillRect(-5, -5, 10, 10);
      ctx.strokeRect(-5, -5, 10, 10);
      ctx.fillStyle = 'black';
      ctx.fillText(this.node.label, 0, 0);
    } else if (this.node instanceof PathNode) {
      ctx.strokeStyle = this.node.state ? 'yellow' : '#DADADA';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = this.node.state ? 'yellow' : '#DADADA';
      ctx.fill();
      ctx.stroke();
    } else if (this.node instanceof GateNode) {
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(10, 0);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.strokeStyle = this.node.isNPN ? '#B60000' : '#F6FF00';
      ctx.fillStyle = this.node.active ? 'orange' : '#DADADA';
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

export class NetworkRenderer implements IDrawable {
  protected canvas: HTMLCanvasElement | null = null;
  protected network: Network | null = null;
  protected nodes: NetworkRendererNode[] = [];
  protected nodeSpacing = 50;

  constructor(canvas?: HTMLCanvasElement, network?: Network) {
    if (canvas) this.setCanvas(canvas);
    if (network) this.setNetwork(network);
  }

  public setCanvas(canvas: HTMLCanvasElement): NetworkRenderer {
    this.canvas = canvas;
    return this;
  }

  public getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  public getContext(): CanvasRenderingContext2D {
    const ctx = this.canvas?.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    return ctx;
  }

  public findBounds(): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
    if (this.nodes.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const node of this.nodes) {
      const { x, y } = node.position;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    return { minX, minY, maxX, maxY };
  }

  public setInitialNodePositions(): void {
    {
      const pins = this.nodes.filter((node) => node.node instanceof PinNode);
      for (let i = 0; i < pins.length; i++) {
        pins[i].position.x = Math.sin((i / pins.length) * Math.PI * 2);
        pins[i].position.y = Math.cos((i / pins.length) * Math.PI * 2);
      }
    }

    const originalPositions = new Map<
      NetworkRendererNode,
      { x: number; y: number }
    >();
    for (const node of this.nodes) {
      originalPositions.set(node, { x: node.position.x, y: node.position.y });
    }
    for (const node of this.nodes) {
      if (node.node instanceof PinNode) continue;
      const connections = Array.from(node.connections);
      if (connections.length === 0) continue;
      let avgX = 0;
      let avgY = 0;
      for (const connection of connections) {
        avgX += originalPositions.get(connection)?.x ?? connection.position.x;
        avgY += originalPositions.get(connection)?.y ?? connection.position.y;
      }
      node.position.x = avgX / connections.length;
      node.position.y = avgY / connections.length;
    }

    for (const node of this.nodes) {
      node.position.x *= this.nodeSpacing;
      node.position.y *= this.nodeSpacing;
    }
  }

  public updateNodePositions(attractFactor = 1, repelFactor = 1) {
    if (attractFactor > 0) {
      // Nodes attract each other to their connections
      const attraction = (1 / this.nodeSpacing) * attractFactor;
      for (const node of this.nodes) {
        for (const connection of node.connections) {
          const dx = connection.position.x - node.position.x;
          const dy = connection.position.y - node.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            const moveX = dx * attraction;
            const moveY = dy * attraction;
            node.position.x += moveX;
            node.position.y += moveY;
            connection.position.x -= moveX;
            connection.position.y -= moveY;
          }
        }
      }
    }
    if (repelFactor > 0) {
      // Nodes push each other away from their connections to avoid overlap
      const repel = this.nodeSpacing * repelFactor;
      for (let i = 0; i < this.nodes.length; i++) {
        const nodeA = this.nodes[i];
        for (let j = i + 1; j < this.nodes.length; j++) {
          const nodeB = this.nodes[j];
          const dx = nodeB.position.x - nodeA.position.x;
          const dy = nodeB.position.y - nodeA.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < repel) {
            const angle = Math.atan2(dy, dx);
            const overlap = repel - distance;
            const moveX = Math.cos(angle) * (overlap / 2);
            const moveY = Math.sin(angle) * (overlap / 2);
            nodeA.position.x -= moveX;
            nodeA.position.y -= moveY;
            nodeB.position.x += moveX;
            nodeB.position.y += moveY;
          }
        }
      }
    }
  }

  public setNetwork(network: Network): NetworkRenderer {
    this.network = network;
    const pins = network
      .getPinNodes()
      .map((pin) => new NetworkRendererNode<PinNode>(pin));
    const paths = network
      .getPathNodes()
      .map((path) => new NetworkRendererNode<PathNode>(path));
    const gates = network
      .getGateNodes()
      .map((gate) => new NetworkRendererNode<GateNode>(gate));
    for (const path of paths) {
      for (const gate of gates) {
        if (
          gate.node.basePaths.includes(path.node) ||
          gate.node.currentPaths.includes(path.node)
        ) {
          path.connections.add(gate);
          gate.connections.add(path);
        }
      }
      for (const pin of pins) {
        if (pin.node.path === path.node) {
          path.connections.add(pin);
          pin.connections.add(path);
        }
      }
    }
    this.nodes = [...pins, ...paths, ...gates];
    this.setInitialNodePositions();
    return this;
  }

  public render(
    options: {
      transform?: Transform;
    } = {},
  ): void {
    const ctx = this.getContext();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const { network } = this;
    if (!network) return;
    const { transform } = options;
    if (transform) {
      const { translateX, translateY, scale } = transform;
      ctx.save();
      applyFieldViewTransform(ctx, translateX, translateY, scale);
    }
    for (const node of this.nodes) {
      node.drawConnections(ctx);
    }
    for (const node of this.nodes) {
      node.draw(ctx);
    }
    if (transform) {
      ctx.restore();
    }
    this.updateNodePositions();
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const { width, height } = ctx.canvas;
    if (this.canvas) {
      ctx.drawImage(this.canvas, 0, 0, width, height);
    }
  }
}
