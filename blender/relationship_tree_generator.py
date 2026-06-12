import bpy
import bmesh
import math
import random
import os
from mathutils import Vector

random.seed(20240614)

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for data_collection in (bpy.data.meshes, bpy.data.curves,
                             bpy.data.materials, bpy.data.images,
                             bpy.data.actions):
        for block in list(data_collection):
            if block.users == 0:
                data_collection.remove(block)

clear_scene()

tree_collection = bpy.data.collections.new("RelationshipTree")
bpy.context.scene.collection.children.link(tree_collection)
layer_collection = bpy.context.view_layer.layer_collection.children[tree_collection.name]
bpy.context.view_layer.active_layer_collection = layer_collection

def bezier_point(p0, p1, p2, p3, t):
    mt = 1.0 - t
    return (mt ** 3) * p0 + 3 * (mt ** 2) * t * p1 + 3 * mt * (t ** 2) * p2 + (t ** 3) * p3

def bezier_tangent(p0, p1, p2, p3, t):
    mt = 1.0 - t
    tangent = 3 * (mt ** 2) * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * (t ** 2) * (p3 - p2)
    if tangent.length < 1e-6:
        tangent = Vector((0.0, 0.0, 1.0))
    return tangent

def make_ring(center, tangent, radius, segments, ridges=0, ridge_depth=0.0):
    tangent = tangent.normalized()
    reference = Vector((0.0, 0.0, 1.0)) if abs(tangent.z) < 0.99 else Vector((1.0, 0.0, 0.0))
    right = tangent.cross(reference).normalized()
    up = right.cross(tangent).normalized()
    
    pts = []
    for i in range(segments):
        angle = 2 * math.pi * i / segments
        r = radius
        if ridges > 0:
            # smooth indentation/ridges
            r = radius * (1.0 - ridge_depth * 0.5 + math.sin(angle * ridges) * ridge_depth * 0.5)
            
        pts.append(center + right * math.cos(angle) * r + up * math.sin(angle) * r)
    return pts

def build_tapered_tube(name, p0, p1, p2, p3, r0, r1,
                        length_segments=20, ring_segments=16, taper_power=1.0, ridges=0, ridge_depth=0.0):
    bm = bmesh.new()
    rings = []
    for i in range(length_segments + 1):
        t = i / length_segments
        center = bezier_point(p0, p1, p2, p3, t)
        tangent = bezier_tangent(p0, p1, p2, p3, t)
        radius = r0 + (r1 - r0) * (t ** taper_power)
        
        # fade out ridges towards the tips of branches
        current_ridge_depth = ridge_depth * (1.0 - t * 0.8) if ridge_depth > 0 else 0.0
        
        ring_pts = make_ring(center, tangent, radius, ring_segments, ridges, current_ridge_depth)
        rings.append([bm.verts.new(pt) for pt in ring_pts])

    for i in range(length_segments):
        for j in range(ring_segments):
            j2 = (j + 1) % ring_segments
            bm.faces.new((rings[i][j], rings[i][j2], rings[i + 1][j2], rings[i + 1][j]))

    bm.faces.new(rings[0][::-1])
    bm.faces.new(rings[-1])

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    tree_collection.objects.link(obj)

    tip_point = bezier_point(p0, p1, p2, p3, 1.0)
    tip_tangent = bezier_tangent(p0, p1, p2, p3, 1.0)
    return obj, tip_point, tip_tangent

def hex_to_rgba(hex_color):
    hex_color = hex_color.lstrip('#')
    r, g, b = (int(hex_color[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
    return (r, g, b, 1.0)

def set_input(bsdf, names, value):
    for n in names:
        if n in bsdf.inputs:
            bsdf.inputs[n].default_value = value
            return True
    return False

def make_material(name, base_color_hex, roughness=0.5, subsurface=0.0,
                   emission_color_hex=None, emission_strength=0.0, glass=False):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]

    set_input(bsdf, ["Base Color"], hex_to_rgba(base_color_hex))
    set_input(bsdf, ["Roughness"], roughness)

    if subsurface > 0.0:
        set_input(bsdf, ["Subsurface Weight", "Subsurface"], subsurface)
        set_input(bsdf, ["Subsurface Radius"], (1.0, 0.2, 0.1))

    if emission_color_hex is not None:
        set_input(bsdf, ["Emission Color", "Emission"], hex_to_rgba(emission_color_hex))
        set_input(bsdf, ["Emission Strength"], emission_strength)

    if glass:
        set_input(bsdf, ["Transmission Weight", "Transmission"], 1.0)
        set_input(bsdf, ["IOR"], 1.5)
        mat.blend_method = 'BLEND'
        set_input(bsdf, ["Alpha"], 0.8)

    return mat

WOOD_MAT = make_material("Mat_Trunk_Wood", "#1a0a00", roughness=0.15, subsurface=0.1, glass=True)
ROOT_MAT = make_material("Mat_Roots_Wood", "#0d0500", roughness=0.2, subsurface=0.1, glass=True)
LEAF_MAT = make_material("Mat_Leaf", "#10b981", roughness=0.2, subsurface=0.3, glass=True)

FLOWER_MAT = make_material("Mat_FlowerNode_Friend", "#3b82f6", roughness=0.1,
                            emission_color_hex="#3b82f6", emission_strength=0.8, glass=True)
FRUIT_MAT = make_material("Mat_FruitNode_Romantic", "#f43f5e", roughness=0.1,
                           emission_color_hex="#f43f5e", emission_strength=0.9, glass=True)
ROOTNODE_MAT = make_material("Mat_RootNode_Parent", "#f59e0b", roughness=0.1,
                              emission_color_hex="#f59e0b", emission_strength=0.6, glass=True)

PROFILE_MAT = make_material("Mat_ProfilePlane", "#ffffff", roughness=1.0,
                             emission_color_hex="#ffffff", emission_strength=1.0)

# Section 3: TRUNK
trunk_p0 = Vector((0.0, 0.0, 0.0))
trunk_p1 = Vector((0.5, 0.2, 3.5))
trunk_p2 = Vector((-0.2, -0.1, 7.5))
trunk_p3 = Vector((0.0, 0.0, 10.0))

trunk_obj, trunk_tip, trunk_tip_tan = build_tapered_tube(
    "Trunk", trunk_p0, trunk_p1, trunk_p2, trunk_p3,
    r0=4.0, r1=1.5, length_segments=40, ring_segments=32, 
    ridges=10, ridge_depth=0.25 # heavy indentation for Banyan feel
)
trunk_obj.data.materials.append(WOOD_MAT)

# BANYAN MAIN BRANCHES (Much wider horizontal spread)
main_branch_objs = []
main_tips = []
aerial_root_objs = []

NUM_MAIN = random.randint(7, 10)
for i in range(NUM_MAIN):
    angle = (2 * math.pi * i / NUM_MAIN) + random.uniform(-0.2, 0.2)
    start_z = random.uniform(8.0, 10.0)
    start = Vector((math.cos(angle) * 1.0, math.sin(angle) * 1.0, start_z))

    horiz = random.uniform(8.0, 14.0) # Much broader
    end_z = random.uniform(11.0, 13.0)
    end = Vector((math.cos(angle) * horiz, math.sin(angle) * horiz, end_z))

    ctrl1 = start + Vector((math.cos(angle) * 3.0, math.sin(angle) * 3.0, 1.0))
    ctrl2 = end + Vector((math.cos(angle) * -2.0, math.sin(angle) * -2.0, -1.0))

    r0 = random.uniform(0.8, 1.2)
    r1 = random.uniform(0.3, 0.5)

    obj, tip, tan = build_tapered_tube(
        f"MainBranch_{i:02d}", start, ctrl1, ctrl2, end,
        r0=r0, r1=r1, length_segments=30, ring_segments=20,
        ridges=4, ridge_depth=0.1
    )
    obj.data.materials.append(WOOD_MAT)
    main_branch_objs.append(obj)
    main_tips.append((tip, tan, r1, angle))

    # AERIAL ROOTS dropping from main branches
    if random.random() > 0.3:
        num_aerial = random.randint(1, 3)
        for a_i in range(num_aerial):
            t = random.uniform(0.3, 0.9)
            ar_start = bezier_point(start, ctrl1, ctrl2, end, t)
            ar_end = Vector((ar_start.x, ar_start.y, random.uniform(-1.0, 0.0)))
            ar_ctrl1 = ar_start + Vector((0, 0, -2.0))
            ar_ctrl2 = ar_end + Vector((random.uniform(-0.5, 0.5), random.uniform(-0.5, 0.5), 2.0))
            
            ar_r0 = r1 * random.uniform(0.3, 0.6)
            ar_r1 = ar_r0 * 0.5
            ar_obj, _, _ = build_tapered_tube(
                f"AerialRoot_{i}_{a_i}", ar_start, ar_ctrl1, ar_ctrl2, ar_end,
                r0=ar_r0, r1=ar_r1, length_segments=20, ring_segments=12,
                ridges=3, ridge_depth=0.15
            )
            ar_obj.data.materials.append(ROOT_MAT)
            aerial_root_objs.append(ar_obj)

# Section 5: SECONDARY BRANCHES
secondary_branch_objs = []
secondary_tips = []

for mi, (m_tip, m_tan, m_r, m_angle) in enumerate(main_tips):
    n_sec = random.randint(4, 6)
    for si in range(n_sec):
        spread_angle = m_angle + random.uniform(-1.0, 1.0)
        start = m_tip

        horiz = random.uniform(3.0, 5.0)
        end_z = random.uniform(13.0, 16.5)
        end = start + Vector((
            math.cos(spread_angle) * horiz,
            math.sin(spread_angle) * horiz,
            max(0.5, end_z - start.z),
        ))

        ctrl1 = start + m_tan.normalized() * 1.5 + Vector((
            random.uniform(-0.5, 0.5), random.uniform(-0.5, 0.5), 0.8,
        ))
        ctrl2 = end + Vector((
            math.cos(spread_angle) * -1.0, math.sin(spread_angle) * -1.0, -0.8,
        ))

        r0 = m_r * random.uniform(0.6, 0.8)
        r1 = random.uniform(0.1, 0.2)

        obj, tip, tan = build_tapered_tube(
            f"SecondaryBranch_{mi:02d}_{si:02d}", start, ctrl1, ctrl2, end,
            r0=r0, r1=r1, length_segments=20, ring_segments=12,
            ridges=2, ridge_depth=0.05
        )
        obj.data.materials.append(WOOD_MAT)
        secondary_branch_objs.append(obj)
        secondary_tips.append((tip, tan, r1, spread_angle))

# Section 6: TERTIARY BRANCHES & LEAVES
tertiary_branch_objs = []
tertiary_tips = []
leaf_objs = []

def create_leaf_mesh(name, location, direction, material):
    bpy.ops.mesh.primitive_plane_add(size=0.8, location=location)
    leaf = bpy.context.active_object
    leaf.name = name
    
    # Diamond shape
    for v in leaf.data.vertices:
        if abs(v.co.x) > 0.1 and abs(v.co.y) > 0.1:
            v.co.x *= 0.5
    leaf.scale = (0.5, 1.0, 0.1)
    
    if direction.length > 0.001:
        rot = direction.to_track_quat('Y', 'Z')
        leaf.rotation_euler = rot.to_euler()
    
    leaf.data.materials.append(material)
    leaf_objs.append(leaf)

for sec_i, (s_tip, s_tan, s_r, s_angle) in enumerate(secondary_tips):
    num_tert = random.randint(3, 5)
    for ti in range(num_tert):
        spread_angle = s_angle + random.uniform(-1.2, 1.2)
        start = s_tip

        horiz = random.uniform(1.5, 3.5)
        end_z = min(22.0, start.z + random.uniform(1.5, 4.0))
        end = start + Vector((
            math.cos(spread_angle) * horiz,
            math.sin(spread_angle) * horiz,
            max(0.4, end_z - start.z),
        ))

        ctrl1 = start + s_tan.normalized() * 1.0
        ctrl2 = end + Vector((
            math.cos(spread_angle) * -0.5, math.sin(spread_angle) * -0.5, -0.4,
        ))

        r0 = max(0.04, s_r * 0.6)
        r1 = max(0.02, r0 * 0.3)

        obj, tip, tan = build_tapered_tube(
            f"TertiaryBranch_{sec_i:02d}_{ti:02d}", start, ctrl1, ctrl2, end,
            r0=r0, r1=r1, length_segments=14, ring_segments=8,
        )
        obj.data.materials.append(WOOD_MAT)
        tertiary_branch_objs.append(obj)
        tertiary_tips.append((Vector(tip), tip.z))

        # Add leaves along the tertiary branch
        for leaf_i in range(random.randint(2, 4)):
            lt = random.uniform(0.3, 0.9)
            leaf_loc = bezier_point(start, ctrl1, ctrl2, end, lt)
            leaf_dir = bezier_tangent(start, ctrl1, ctrl2, end, lt).cross(Vector((0,0,1))) + Vector((random.uniform(-0.2, 0.2), random.uniform(-0.2, 0.2), random.uniform(-0.1, 0.5)))
            create_leaf_mesh(f"Leaf_{sec_i}_{ti}_{leaf_i}", leaf_loc, leaf_dir, LEAF_MAT)

# Section 7: ROOTS
root_objs = []
NUM_ROOTS = random.randint(8, 12)

for i in range(NUM_ROOTS):
    angle = (2 * math.pi * i / NUM_ROOTS) + random.uniform(-0.3, 0.3)
    start = Vector((math.cos(angle) * 1.5, math.sin(angle) * 1.5, 0.5))

    horiz = random.uniform(3.0, 6.0)
    end_z = random.uniform(-3.5, -1.0)
    end = Vector((math.cos(angle) * horiz, math.sin(angle) * horiz, end_z))

    ctrl1 = start + Vector((math.cos(angle) * 1.5, math.sin(angle) * 1.5, -0.5))
    ctrl2 = end + Vector((math.cos(angle) * -1.0, math.sin(angle) * -1.0, 1.0))

    r0 = random.uniform(0.8, 1.5)
    r1 = random.uniform(0.1, 0.2)

    obj, tip, tan = build_tapered_tube(
        f"Root_{i:02d}", start, ctrl1, ctrl2, end,
        r0=r0, r1=r1, length_segments=20, ring_segments=16,
        ridges=4, ridge_depth=0.15
    )
    obj.data.materials.append(ROOT_MAT)
    root_objs.append(obj)

# Section 8: PROFILE NODES
profile_plane_objs = []
all_node_objs = []

RELATIONSHIP_TYPE_BY_ZONE = {
    "flower_nodes": "friend",
    "fruit_nodes": "romantic",
    "root_nodes": "parent",
}

def create_flower_mesh(name, location, radius, zone, node_index, material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=radius*0.4, location=location)
    flower = bpy.context.active_object
    flower.name = name
    flower.data.materials.append(material)

    num_petals = 6
    for p in range(num_petals):
        angle = 2 * math.pi * p / num_petals
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=radius*0.7, location=(0,0,0))
        petal = bpy.context.active_object
        petal.scale = (1.0, 0.3, 0.1)
        petal.location = location + Vector((math.cos(angle)*radius*0.6, math.sin(angle)*radius*0.6, 0))
        petal.rotation_euler = (0, 0, angle)
        petal.data.materials.append(material)
        
        petal.select_set(True)
        flower.select_set(True)
        bpy.context.view_layer.objects.active = flower
        bpy.ops.object.join()

    flower.select_set(False)
    flower["zone"] = zone
    flower["node_index"] = node_index
    flower["relationship_type"] = RELATIONSHIP_TYPE_BY_ZONE[zone]
    all_node_objs.append(flower)
    return flower

def create_fruit_mesh(name, location, radius, zone, node_index, material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=radius, location=location)
    fruit = bpy.context.active_object
    fruit.name = name
    fruit.data.materials.append(material)
    
    # Indent top/bottom for organic fruit look
    for v in fruit.data.vertices:
        if v.co.z > radius * 0.7:
            v.co.z *= 0.6
            v.co.x *= 1.1
            v.co.y *= 1.1
        elif v.co.z < -radius * 0.7:
            v.co.z *= 0.6

    fruit.data.update()
    
    fruit["zone"] = zone
    fruit["node_index"] = node_index
    fruit["relationship_type"] = RELATIONSHIP_TYPE_BY_ZONE[zone]
    all_node_objs.append(fruit)
    return fruit

def create_disc_node(name, location, radius, zone, node_index, material):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=0.15,
                                         location=location, vertices=32)
    obj = bpy.context.active_object
    obj.name = name
    
    # Indent disc slightly
    for v in obj.data.vertices:
        if v.co.x**2 + v.co.y**2 < (radius*0.5)**2:
            v.co.z *= 0.5
    obj.data.update()
            
    obj.data.materials.append(material)
    obj["zone"] = zone
    obj["node_index"] = node_index
    obj["relationship_type"] = RELATIONSHIP_TYPE_BY_ZONE[zone]
    all_node_objs.append(obj)
    return obj

def create_profile_plane(zone, index, node_location, facing_offset):
    plane_loc = node_location + facing_offset
    bpy.ops.mesh.primitive_plane_add(size=1.2, location=plane_loc)
    obj = bpy.context.active_object
    obj.rotation_euler = (math.radians(90.0), 0.0, 0.0)
    obj.name = f"ProfilePlane_{zone}_{index}"

    if not obj.data.uv_layers:
        obj.data.uv_layers.new(name="UVMap")

    obj.data.materials.append(PROFILE_MAT)
    obj["zone"] = zone
    obj["node_index"] = index
    obj["relationship_type"] = RELATIONSHIP_TYPE_BY_ZONE[zone]

    profile_plane_objs.append(obj)
    return obj

tertiary_tips.sort(key=lambda item: -item[1])

num_fruit = min(12, max(8, len(tertiary_tips) // 5))
fruit_tip_data = tertiary_tips[:num_fruit]

remaining_tips = tertiary_tips[num_fruit:]
flower_tip_data = remaining_tips[:30]

for idx, (tip, _z) in enumerate(flower_tip_data):
    create_flower_mesh(f"FlowerNode_{idx:02d}", tip, 0.4,
                        zone="flower_nodes", node_index=idx, material=FLOWER_MAT)
    create_profile_plane("flower_nodes", idx, tip, Vector((0.0, -0.7, 0.0)))

for idx, (tip, _z) in enumerate(fruit_tip_data):
    create_fruit_mesh(f"FruitNode_{idx:02d}", tip, 0.55,
                        zone="fruit_nodes", node_index=idx, material=FRUIT_MAT)
    create_profile_plane("fruit_nodes", idx, tip, Vector((0.0, -0.85, 0.0)))

NUM_ROOT_NODES = random.randint(4, 6)
for idx in range(NUM_ROOT_NODES):
    angle = (2 * math.pi * idx / NUM_ROOT_NODES) + (math.pi / NUM_ROOT_NODES)
    loc = Vector((math.cos(angle) * 2.5, math.sin(angle) * 2.5, -0.3))
    create_disc_node(f"RootNode_{idx:02d}", loc, 0.8,
                      zone="root_nodes", node_index=idx, material=ROOTNODE_MAT)
    create_profile_plane("root_nodes", idx, loc, Vector((0.0, -0.9, 0.0)))

# Section 9: JOIN
# Join the trunk, branches, roots AND leaves into one single massive tree mesh
tree_parts = ([trunk_obj] + main_branch_objs + secondary_branch_objs
               + tertiary_branch_objs + root_objs + aerial_root_objs + leaf_objs)

bpy.ops.object.select_all(action='DESELECT')
for part in tree_parts:
    part.select_set(True)
bpy.context.view_layer.objects.active = trunk_obj
bpy.ops.object.join()

tree_obj = trunk_obj
tree_obj.name = "RelationshipTree_TrunkBranchesRoots"

# Section 10: SHAPE KEYS
COLLAPSE_TARGET = Vector((0.0, 0.0, 0.0))
COLLAPSE_FACTOR_TREE = 0.94
COLLAPSE_FACTOR_NODE = 0.97

def add_seed_grown_shape_keys(obj, collapse_target_local, collapse_factor):
    obj.shape_key_add(name="Basis", from_mix=False)
    obj.shape_key_add(name="Grown", from_mix=False)
    seed_key = obj.shape_key_add(name="Seed", from_mix=False)
    for point in seed_key.data:
        original = Vector(point.co)
        point.co = original.lerp(collapse_target_local, collapse_factor)

add_seed_grown_shape_keys(tree_obj, COLLAPSE_TARGET, COLLAPSE_FACTOR_TREE)

for node_obj in all_node_objs + profile_plane_objs:
    add_seed_grown_shape_keys(node_obj, Vector((0.0, 0.0, 0.0)), COLLAPSE_FACTOR_NODE)

# Section 11: EXPORT
if bpy.data.filepath:
    base_dir = os.path.dirname(bpy.data.filepath)
else:
    # Use script directory when running standalone
    base_dir = os.path.dirname(os.path.abspath(__file__))

export_dir = os.path.join(base_dir, "assets", "exports")
os.makedirs(export_dir, exist_ok=True)
export_path = os.path.join(export_dir, "relationship_tree.glb")

bpy.ops.object.select_all(action='SELECT')

bpy.ops.export_scene.gltf(
    filepath=export_path,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_animations=True,
    export_morph=True,
    export_normals=True,
    export_texcoords=True,
    export_materials='EXPORT',
)

print(f"Relationship tree exported to: {export_path}")
print(
    f"Main branches: {NUM_MAIN} | Roots: {NUM_ROOTS} | Aerial Roots: {len(aerial_root_objs)} | Leaves: {len(leaf_objs)} | "
    f"Flower nodes: {len(flower_tip_data)} | Fruit nodes: {len(fruit_tip_data)} | "
    f"Root nodes: {NUM_ROOT_NODES}"
)
