"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid, Environment } from "@react-three/drei";
import * as THREE from "three";

interface PhysicsObject {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  properties: {
    mass: number;
    [key: string]: any;
  };
}

interface PhysicsForce {
  type: string;
  magnitude: number;
  direction: [number, number, number];
  application_point: [number, number, number];
}

interface PhysicsInteraction {
  type: string;
  objects: string[];
  properties: {
    [key: string]: any;
  };
}

interface PhysicsModelData {
  objects: PhysicsObject[];
  physics: {
    type: string;
    properties: {
      [key: string]: any;
    };
    forces: PhysicsForce[];
  };
  interactions: PhysicsInteraction[];
}

const PhysicsObject3D = ({ object }: { object: PhysicsObject }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = new THREE.Color(object.color);

  const rotation = object.rotation.map(deg => (deg * Math.PI) / 180) as [number, number, number];

  const renderGeometry = () => {
    switch (object.type.toLowerCase()) {
      case "cube":
      case "box":
        return <boxGeometry args={[1, 1, 1]} />;
      case "sphere":
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case "cylinder":
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case "cone":
        return <coneGeometry args={[0.5, 1, 32]} />;
      case "plane":
        return <planeGeometry args={[1, 1]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={object.position}
      rotation={rotation}
      scale={object.scale}
    >
      {renderGeometry()}
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const ForceArrow = ({ force }: { force: PhysicsForce }) => {
  const { magnitude, direction, application_point } = force;
  
  const dir = new THREE.Vector3(...direction);
  dir.normalize().multiplyScalar(magnitude);
  
  const start = new THREE.Vector3(...application_point);
  const end = new THREE.Vector3().copy(start).add(dir);
  
  const points = [start, end];
  
  return (
    <group>
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([...start.toArray(), ...end.toArray()]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="red" linewidth={2} />
      </line>
      {/* Arrow head */}
      <mesh position={end.toArray()} rotation={[0, 0, Math.atan2(dir.y, dir.x)]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
  );
};

const Scene = ({ modelData }: { modelData: PhysicsModelData }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
  }, [camera, modelData]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Render all objects */}
      {modelData.objects.map((object) => (
        <PhysicsObject3D key={object.id} object={object} />
      ))}
      
      {/* Render forces */}
      {modelData.physics.forces.map((force, index) => (
        <ForceArrow key={`force-${index}`} force={force} />
      ))}
      
      {/* Environment helpers */}
      <Grid infiniteGrid position={[0, -0.01, 0]} />
      <OrbitControls makeDefault />
      <Environment preset="city" />
    </>
  );
};

export default function PhysicsScene({ modelData }: { modelData: PhysicsModelData }) {
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden">
      <Canvas shadows>
        <Scene modelData={modelData} />
      </Canvas>
    </div>
  );
}
