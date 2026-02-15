import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';

const VeinPath = ({ id, color, points, radius }) => {
    // Create a 3D curve from points
    const curve = new THREE.CatmullRomCurve3(
        points.map(p => new THREE.Vector3(p.x, p.y, p.z))
    );

    return (
        <mesh>
            <tubeGeometry args={[curve, 64, radius, 8, false]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                roughness={0.3}
                metalness={0.1}
                transparent
                opacity={0.9}
            />
        </mesh>
    );
};

const ArmModel = ({ veinData }) => {
    const groupRef = useRef();

    useFrame((state) => {
        // Subtle breathing animation
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    // Default paths if no data provided (fallback)
    const defaultPaths = {
        cephalic: [
            { x: -0.5, y: -2.5, z: 0.5 }, { x: -0.6, y: -1, z: 0.55 },
            { x: -0.55, y: 1, z: 0.5 }, { x: -0.4, y: 2.5, z: 0.4 }
        ],
        basilic: [
            { x: 0.5, y: -2.5, z: 0.4 }, { x: 0.55, y: -1, z: 0.5 },
            { x: 0.5, y: 1.5, z: 0.55 }, { x: 0.4, y: 2.8, z: 0.5 }
        ],
        medianCubital: [
            { x: -0.55, y: -0.5, z: 0.52 }, { x: 0.0, y: 0, z: 0.6 },
            { x: 0.55, y: 0.5, z: 0.52 }
        ]
    };

    return (
        <group ref={groupRef}>
            {/* Forearm - Cylinder */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.8, 0.6, 6, 32]} />
                <meshStandardMaterial
                    color="#e0ac69"
                    roughness={0.5}
                    metalness={0.1}
                />
            </mesh>

            {/* Veins - Dynamic Rendering */}
            {veinData && Object.entries(veinData).map(([key, vein]) => {
                // Map vein keys to 3D paths (simplified mapping)
                // In a real app, 3D coordinates would come from the scan
                // Here we map known keys to the default paths to show *something*
                let points = defaultPaths[key];

                // If it's a known vein without a path (e.g. dorsal), skip or use a generic path
                if (!points) {
                    if (key.includes('cephalic')) points = defaultPaths.cephalic;
                    else if (key.includes('basilic')) points = defaultPaths.basilic;
                    else if (key.includes('median')) points = defaultPaths.medianCubital;
                    else return null;
                }

                // Scale radius: simple heuristic (diameter mm / 40 -> 3D units)
                const radius = (vein.lineWidth || 3) / 40;

                return (
                    <VeinPath
                        key={key}
                        id={key}
                        color={vein.color || '#00e5ff'}
                        radius={radius}
                        points={points}
                    />
                );
            })}
        </group>
    );
};

const ThreeDVeinViewer = ({ veinData }) => {
    return (
        <div className="w-full h-full min-h-[300px] relative bg-gradient-to-b from-gray-900 to-black">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
                <OrbitControls
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                    minDistance={4}
                    maxDistance={12}
                />

                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                {/* Scene */}
                <ArmModel veinData={veinData} />

                {/* Environment for reflections */}
                {/* <Environment preset="city" /> - Can be heavy, stick to lights for now */}
            </Canvas>

            {/* Overlay Info */}
            <div className="absolute bottom-4 left-4 pointer-events-none">
                <p className="text-xs text-gray-400 font-mono">INTERACTIVE 3D MODEL</p>
                <p className="text-[10px] text-blue-400 font-mono animate-pulse">DRAG TO ROTATE • SCROLL ZOOM</p>
            </div>
        </div>
    );
};

export default ThreeDVeinViewer;
