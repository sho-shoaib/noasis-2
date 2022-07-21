import React, { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "react-three-fiber";
import { GuiPanel, GuiRange, GuiColor } from "react-guify";

import "./styles.css";

const parameters = {
  size: 0.001,
  count: 100000,
  radius: 4,
  branches: 12,
  spin: 1.25,
  randomness: 0.25,
  randomnessPower: 4,
  colorIn: "#BC027F",
  colorOut: "#004CA3"
};

function BlackHoleNucleus({ size }) {
  const meshRef = useRef();

  return (
    <mesh ref={meshRef} scale={[size, size, size]} position={[0, 0, 0]}>
      <sphereBufferGeometry
        attach="geometry"
        args={[0.5, 32, 32, 0, 6.4, 0, 6.3]}
      />
      <meshBasicMaterial attach="material" color="#000" />
    </mesh>
  );
}

const Galaxy = () => {
  const particles = useRef();
  const clock = new THREE.Clock();

  useEffect(() => {
    generateGalaxy();
  });

  useFrame(() => {
    const elapsedTime = clock.getElapsedTime();

    particles.current.rotation.y = elapsedTime * 0.05;
  });

  const generateGalaxy = () => {
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const colorInside = new THREE.Color(parameters.colorIn);
    const colorOutside = new THREE.Color(parameters.colorOut);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;

      const radius = Math.random() * parameters.radius;
      const spinAngle = radius * parameters.spin;
      const branchAngle =
        ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

      const randomX =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;
      const randomY =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;
      const randomZ =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, radius / parameters.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    particles.current.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particles.current.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );
  };

  return (
    <points ref={particles}>
      <bufferGeometry />
      <pointsMaterial
        size={parameters.size}
        sizeAttenuation={true}
        depthWrite={false}
        vertexColors={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default function App() {
  const gui = useRef();
  const [state, setState] = useState(parameters);

  return (
    <>
      <GuiPanel
        ref={gui}
        data={state}
        setData={setState}
        barMode="none"
        align="right"
        theme="dark"
      >
        <GuiRange
          label="Count"
          property="count"
          min={100}
          max={1000000}
          step={100}
        />
        <GuiRange
          label="Size"
          property="size"
          min={0.001}
          max={0.1}
          step={0.001}
        />
        <GuiRange
          label="Radius"
          property="radius"
          min={0.01}
          max={20}
          step={0.01}
        />
        <GuiRange
          label="Branches"
          property="branches"
          min={2}
          max={20}
          step={1}
        />
        <GuiRange label="Spin" property="spin" min={-5} max={5} step={0.001} />
        <GuiRange
          label="Randomness"
          property="randomness"
          min={0}
          max={2}
          step={0.001}
        />
        <GuiRange
          label="Randomness Power"
          property="randomnessPower"
          min={1}
          max={10}
          step={0.001}
        />
        <GuiColor label="Inside Color" property="colorIn" />
        <GuiColor label="Outside Color" property="colorOut" />
      </GuiPanel>

      <Canvas
        colorManagement={false}
        style={{ height: `100vh` }}
        camera={{ position: [0, 2, 5] }}
      >
        <color attach="background" args={["#11081F"]} />

        <Suspense fallback={null}>
          <BlackHoleNucleus size={2} />
          <Galaxy />
        </Suspense>
      </Canvas>
    </>
  );
}
