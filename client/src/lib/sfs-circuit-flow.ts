/**
 * SFS Circuit Flow - Golden Circuit Background Animation
 * Creates animated golden circuits on dark background
 */

interface CircuitNode {
  x: number;
  y: number;
  connections: number[];
  pulsePhase: number;
}

class CircuitFlowAnimation {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private nodes: CircuitNode[] = [];
  private animationId: number | null = null;
  private isVisible: boolean = true;
  private time: number = 0;

  // Colors from SFS theme
  private readonly colors = {
    gold: '#d4af37',
    goldLight: '#e6c454',
    goldDark: '#b8941f',
    goldGlow: '#f4d46f',
    black: '#0a0806',
    brown: '#1a1512',
  };

  constructor(canvasId: string = 'sfs-circuit') {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.warn(`Canvas with id "${canvasId}" not found`);
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d')!;
      return;
    }

    this.canvas = canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;

    this.init();
  }

  private init(): void {
    // Set canvas to full screen
    this.resize();

    // Handle resize
    window.addEventListener('resize', () => this.resize());

    // Handle visibility change (pause when not visible)
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible && !this.animationId) {
        this.animate();
      }
    });

    // Generate nodes
    this.generateNodes();

    // Start animation
    this.animate();
  }

  private resize(): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.scale(dpr, dpr);

    // Regenerate nodes on resize
    this.generateNodes();
  }

  private generateNodes(): void {
    this.nodes = [];
    const cols = Math.floor(window.innerWidth / 100);
    const rows = Math.floor(window.innerHeight / 100);

    // Create grid of nodes
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (col + 0.5) * (window.innerWidth / cols);
        const y = (row + 0.5) * (window.innerHeight / rows);

        // Add some randomness to position
        const jitterX = (Math.random() - 0.5) * 30;
        const jitterY = (Math.random() - 0.5) * 30;

        this.nodes.push({
          x: x + jitterX,
          y: y + jitterY,
          connections: [],
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    // Connect nearby nodes
    this.nodes.forEach((node, i) => {
      this.nodes.forEach((otherNode, j) => {
        if (i === j) return;

        const dx = node.x - otherNode.x;
        const dy = node.y - otherNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Connect nodes within range
        if (distance < 150 && Math.random() > 0.7) {
          node.connections.push(j);
        }
      });
    });
  }

  private drawNode(node: CircuitNode): void {
    const pulse = Math.sin(this.time * 0.001 + node.pulsePhase) * 0.5 + 0.5;
    const size = 2 + pulse * 2;

    // Outer glow
    const gradient = this.ctx.createRadialGradient(
      node.x, node.y, 0,
      node.x, node.y, size * 3
    );
    gradient.addColorStop(0, this.hexToRgba(this.colors.goldGlow, 0.8));
    gradient.addColorStop(0.5, this.hexToRgba(this.colors.gold, 0.3));
    gradient.addColorStop(1, this.hexToRgba(this.colors.gold, 0));

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, size * 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Core
    this.ctx.fillStyle = this.colors.goldLight;
    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawConnection(from: CircuitNode, to: CircuitNode, progress: number): void {
    const gradient = this.ctx.createLinearGradient(from.x, from.y, to.x, to.y);

    if (progress < 0.5) {
      // Pulse traveling from -> to
      const pulsePos = progress * 2;
      gradient.addColorStop(0, this.hexToRgba(this.colors.goldDark, 0.2));
      gradient.addColorStop(Math.max(0, pulsePos - 0.1), this.hexToRgba(this.colors.goldDark, 0.2));
      gradient.addColorStop(pulsePos, this.hexToRgba(this.colors.goldLight, 0.8));
      gradient.addColorStop(Math.min(1, pulsePos + 0.1), this.hexToRgba(this.colors.goldDark, 0.2));
      gradient.addColorStop(1, this.hexToRgba(this.colors.goldDark, 0.2));
    } else {
      // Fade state
      gradient.addColorStop(0, this.hexToRgba(this.colors.goldDark, 0.2));
      gradient.addColorStop(1, this.hexToRgba(this.colors.goldDark, 0.2));
    }

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
  }

  private animate = (): void => {
    if (!this.isVisible) {
      this.animationId = null;
      return;
    }

    this.time += 16; // ~60fps

    // Clear canvas with dark background
    this.ctx.fillStyle = this.colors.black;
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // Draw connections
    this.nodes.forEach((node, i) => {
      node.connections.forEach((connectedIndex) => {
        const connectedNode = this.nodes[connectedIndex];
        const progress = (Math.sin(this.time * 0.0005 + i * 0.1) + 1) / 2;
        this.drawConnection(node, connectedNode, progress);
      });
    });

    // Draw nodes
    this.nodes.forEach((node) => {
      this.drawNode(node);
    });

    this.animationId = requestAnimationFrame(this.animate);
  };

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  public start(): void {
    if (!this.animationId) {
      this.animate();
    }
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public destroy(): void {
    this.stop();
    window.removeEventListener('resize', () => this.resize());
    document.removeEventListener('visibilitychange', () => {});
  }
}

// Auto-initialize if canvas exists
let circuitFlow: CircuitFlowAnimation | null = null;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('sfs-circuit');
    if (canvas) {
      circuitFlow = new CircuitFlowAnimation('sfs-circuit');
    }
  });
}

export { CircuitFlowAnimation, circuitFlow };
export default CircuitFlowAnimation;
