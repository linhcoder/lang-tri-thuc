import importlib.util
import json
import pathlib
import tempfile
import unittest
from PIL import Image

spec = importlib.util.spec_from_file_location('web_images', pathlib.Path(__file__).parents[1] / 'optimize-web-images.py')
optimizer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(optimizer)


class WebImagesTest(unittest.TestCase):
    def test_atlas_keeps_pixels_dimensions_and_alpha(self):
        with tempfile.TemporaryDirectory() as folder:
            source = pathlib.Path(folder) / 'atlas.png'
            image = Image.new('RGBA', (128, 96))
            image.putdata([(x % 256, y % 256, (x + y) % 256, (x * 3) % 256) for y in range(96) for x in range(128)])
            image.save(source)
            original = source.read_bytes()
            result = optimizer.optimize_image((source, 'village/npc-directions-v1.png'))
            # PNG can beat WebP on tiny procedural fixtures; retain it in that case.
            if result:
                self.assertEqual(result['mode'], 'lossless')
                with Image.open(source.with_suffix('.webp')) as decoded:
                    self.assertEqual(decoded.convert('RGBA').tobytes(), image.tobytes())
            self.assertEqual(source.read_bytes(), original)

    def test_build_advertises_webp_with_png_fallback_and_is_repeatable(self):
        with tempfile.TemporaryDirectory() as folder:
            build = pathlib.Path(folder)
            (build / 'index.html').write_text('<html></html>')
            bundle = build / 'assets/resources'
            metadata = bundle / 'import/aa/aa-fixture.json'
            native = bundle / 'native/aa/aa-fixture.png'
            metadata.parent.mkdir(parents=True)
            native.parent.mkdir(parents=True)
            metadata.write_text(json.dumps([1, 0, 0, ['cc.ImageAsset'], 0, [{'fmt': '0', 'w': 0, 'h': 0}, -1], [0], 0, [], [], []]))
            Image.new('RGBA', (512, 512), (20, 120, 60, 180)).save(native)
            first = optimizer.optimize_build(build)
            self.assertEqual(first['images'], 1)
            self.assertEqual(json.loads(metadata.read_text())[5][0]['fmt'], '4_0')
            self.assertTrue(native.is_file())
            self.assertTrue(native.with_suffix('.webp').is_file())
            self.assertEqual(first, optimizer.optimize_build(build))

    def test_scenery_always_preserves_alpha(self):
        with tempfile.TemporaryDirectory() as folder:
            source = pathlib.Path(folder) / 'scene.png'
            image = Image.new('RGBA', (256, 256))
            image.putdata([(x, y, (x + y) // 2, min(255, x * 4)) for y in range(256) for x in range(256)])
            image.save(source)
            result = optimizer.optimize_image((source, 'village/temple-v3.png'))
            if result:
                with Image.open(source.with_suffix('.webp')) as decoded:
                    self.assertEqual(decoded.convert('RGBA').getchannel('A').tobytes(), image.getchannel('A').tobytes())
                if result['mode'] != 'lossless':
                    self.assertGreaterEqual(result['visiblePsnr'], 34)
                    self.assertGreaterEqual(result['previewPsnr768'], 34)


if __name__ == '__main__':
    unittest.main()
